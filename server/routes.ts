import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import crypto from "node:crypto";
import rateLimit from "express-rate-limit";
import { storage } from "./storage.js";
import { insertCalculationSchema, insertLeadSchema, SUPPORTED_CURRENCIES } from "../shared/schema.js";
import { ZodError } from "zod";
import { z } from "zod";
import { sendReportEmail, sendLeadConfirmationEmail } from "./email.js";

/* ============================================================
 * Helpers
 * ============================================================ */

const ID_TOKEN_SECRET =
  process.env.SESSION_SECRET || process.env.ID_TOKEN_SECRET || "dev-fallback-please-set-SESSION_SECRET";

/** Sign an arbitrary string with HMAC-SHA256 → 16-char hex token. Used for
 *  read-back and unsubscribe URLs so we don't expose other people's data. */
function signId(id: string): string {
  return crypto
    .createHmac("sha256", ID_TOKEN_SECRET)
    .update(id)
    .digest("hex")
    .slice(0, 16);
}
function verifyToken(id: string, token: string | undefined): boolean {
  if (!token || token.length !== 16) return false;
  const expected = signId(id);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(token, "hex"));
  } catch {
    return false;
  }
}

/** Build the public unsubscribe URL embedded in transactional emails. */
function buildUnsubscribeUrl(req: Request, email: string): string {
  const norm = email.trim().toLowerCase();
  const token = signId(`unsub:${norm}`);
  return `${req.protocol}://${req.get("host")}/api/unsubscribe?email=${encodeURIComponent(norm)}&token=${token}`;
}

/** Inline HTML page returned by /api/unsubscribe — keep it tiny and self-contained. */
function unsubscribeHtmlPage(success: boolean, message?: string): string {
  const title = success ? "C'est fait — tes données sont supprimées." : "Désinscription";
  const body = success
    ? "Toutes les données associées à cet email ont été supprimées de FinkSmart. Tu ne recevras plus aucun email de notre part. Si tu changes d'avis, refais simplement le test sur finksmart.com."
    : message || "Lien invalide ou expiré.";
  const accent = success ? "#10B981" : "#F59E0B";
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>
body{margin:0;padding:0;background:#FEF6E4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1E293B;}
.wrap{max-width:520px;margin:48px auto;padding:0 20px;}
.card{background:#fff;border:1px solid #F5E6C9;border-radius:16px;padding:32px;text-align:center;box-shadow:0 4px 20px -8px rgba(15,23,42,.08);}
h1{font-size:22px;margin:0 0 12px;color:${accent};}
p{font-size:15px;line-height:1.6;color:#475569;margin:0 0 20px;}
a{display:inline-block;padding:10px 22px;border-radius:12px;background:#FBBF24;color:#1E1B14 !important;text-decoration:none;font-weight:700;font-size:13px;}
.footer{margin-top:18px;font-size:12px;color:#94A3B8;}
</style></head><body><div class="wrap"><div class="card">
<h1>${title}</h1><p>${body}</p>
<a href="https://finksmart.com">Retour sur finksmart.com</a>
<div class="footer">FinkSmart · hello@finksmart.com</div>
</div></div></body></html>`;
}

/** Allow letters (any script), spaces, apostrophes and hyphens — 1..80 chars.
 *  Drops anything else (HTML tags, script payloads, etc.). */
function sanitizeName(input: string): string {
  return input
    .normalize("NFC")
    .replace(/[^\p{L}\p{M} '\-]/gu, "")
    .trim()
    .slice(0, 80);
}

/** Drop sensitive fields before returning a calculation publicly. */
function sanitizeCalculationForRead<T extends Record<string, any>>(row: T): Omit<T, "ipAddress" | "ipLocation"> {
  if (!row) return row;
  const { ipAddress: _ip, ipLocation: _loc, ...rest } = row;
  return rest;
}

/* Rate limiters ---------------------------------------------------- */
const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again in a minute." },
});
const sendReportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many report requests from this IP. Try again later." },
});
const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

async function resolveIpLocation(ip: string | null): Promise<string | null> {
  if (!ip || ip === "::1" || ip === "127.0.0.1" || ip === "::ffff:127.0.0.1") return null;
  try {
    const cleanIp = ip.replace(/^::ffff:/, "");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`https://freeipapi.com/api/json/${cleanIp}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.countryName) return null;
    const parts = [data.cityName, data.regionName, data.countryName].filter(Boolean);
    return parts.join(", ") || null;
  } catch {
    return null;
  }
}

const saveReportSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  calculationId: z.string().nullable(),
  freedomScore: z.number(),
  freedomAge: z.number(),
  targetAge: z.number(),
  gapPercent: z.number(),
  requiredCapital: z.number(),
  plannedCapital: z.number(),
  country: z.string(),
  currency: z.string(),
  currencySymbol: z.string(),
  age: z.number(),
  monthlyIncome: z.number(),
  desiredMonthlyIncome: z.number(),
  monthlySavingsRate: z.number(),
  currentSavings: z.number(),
  personality: z.string(),
  narrativeType: z.string(),
  /* Phase 2 — Risk DNA (optional, included only if user has done it). */
  climate: z.string().nullable().optional(),
  climateName: z.string().nullable().optional(),
  climateReturn: z.number().nullable().optional(),
  climateAdvice1: z.string().nullable().optional(),
  climateAdvice2: z.string().nullable().optional(),
  climateAdvice3: z.string().nullable().optional(),
  allocBonds: z.number().nullable().optional(),
  allocEquity: z.number().nullable().optional(),
  allocAlt: z.number().nullable().optional(),
  dnaScore: z.number().nullable().optional(),
  /* Real-world working URLs surfaced in the email body. */
  reportUrl: z.string().nullable().optional(),
  retakeUrl: z.string().nullable().optional(),
  riskDnaUrl: z.string().nullable().optional(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/calculations", writeLimiter, async (req, res) => {
    try {
      const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || null;
      const data = insertCalculationSchema.parse(req.body);
      const ipLocation = await resolveIpLocation(ipAddress);
      const calculation = await storage.createCalculation({ ...data, ipAddress, ipLocation });
      // Return the row WITHOUT ipAddress / ipLocation, plus a signed
      // read-back token so the SPA can later GET /api/calculations/:id
      // with `?token=…`. Without the token the row is not returned.
      res.json({
        ...sanitizeCalculationForRead(calculation as any),
        readToken: signId(calculation.id),
      });
    } catch (e) {
      if (e instanceof ZodError) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Calculation validation error:", e.errors);
        }
        res.status(400).json({ error: "Invalid data" });
      } else {
        if (process.env.NODE_ENV !== "production") {
          console.error("Calculation save error:", e);
        }
        res.status(500).json({ error: "Failed to save calculation" });
      }
    }
  });

  app.get("/api/calculations/:id", readLimiter, async (req, res) => {
    try {
      const id = String(req.params.id || "");
      const tokenRaw = req.query.token;
      const token = typeof tokenRaw === "string" ? tokenRaw : "";
      // Token-gated read: only the original creator (who has the token from
      // their POST response) can fetch their data back. Stops UUID-guess
      // enumeration of other users' financial data.
      if (!verifyToken(id, token)) {
        return res.status(404).json({ error: "Calculation not found" });
      }
      const calculation = await storage.getCalculation(id);
      if (!calculation) {
        return res.status(404).json({ error: "Calculation not found" });
      }
      res.json(sanitizeCalculationForRead(calculation as any));
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Get calculation error:", e);
      }
      res.status(500).json({ error: "Failed to get calculation" });
    }
  });

  app.post("/api/leads", writeLimiter, async (req, res) => {
    try {
      const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || null;
      const raw = insertLeadSchema.parse(req.body);
      // Sanitize free-text fields before storing.
      const data = {
        ...raw,
        name: sanitizeName(raw.name ?? ""),
        email: (raw.email ?? "").trim().toLowerCase().slice(0, 254),
      };
      const ipLocation = await resolveIpLocation(ipAddress);
      const lead = await storage.createLead({ ...data, ipAddress, ipLocation });

      if (data.email && data.name) {
        let calcData: any = {};
        if (data.calculationId) {
          const calc = await storage.getCalculation(data.calculationId);
          if (calc) {
            const currencyInfo = SUPPORTED_CURRENCIES[calc.currency];
            calcData = {
              freedomAge: calc.freedomAge,
              targetAge: calc.targetFreedomAge,
              requiredCapital: calc.requiredCapital,
              plannedCapital: calc.plannedCapital,
              age: calc.age,
              currency: calc.currency,
              currencySymbol: currencyInfo?.symbol || calc.currency,
              desiredMonthlyIncome: calc.desiredMonthlyIncome,
              reportUrl: `${req.protocol}://${req.get("host")}/report/${calc.id}?token=${signId(calc.id)}`,
            };
          }
        }

        const unsubUrl = buildUnsubscribeUrl(req, data.email);
        sendLeadConfirmationEmail({
          recipientEmail: data.email,
          recipientName: data.name,
          freedomScore: data.freedomScore ?? 0,
          gapPercent: data.gapPercent ?? 0,
          unsubscribeUrl: unsubUrl,
          ...calcData,
        }).catch((err) => {
          if (process.env.NODE_ENV !== "production") {
            console.error("Lead confirmation email failed:", err);
          }
        });
      }

      // Don't return the IP/location.
      res.json(sanitizeCalculationForRead(lead as any));
    } catch (e) {
      if (e instanceof ZodError) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Lead validation error:", e.errors);
        }
        res.status(400).json({ error: "Invalid data" });
      } else {
        if (process.env.NODE_ENV !== "production") {
          console.error("Lead save error:", e);
        }
        res.status(500).json({ error: "Failed to save lead" });
      }
    }
  });

  /* GDPR — one-click unsubscribe / data deletion via signed link.
   * Expected URL: /api/unsubscribe?email=<email>&token=<HMAC>
   * Returns a tiny HTML confirmation page. Deletes EVERY lead row that
   * matches the email — that's what right-to-erasure expects. */
  app.get("/api/unsubscribe", readLimiter, async (req, res) => {
    res.set("Content-Type", "text/html; charset=utf-8");
    const email = String(req.query.email || "").trim().toLowerCase();
    const token = String(req.query.token || "");
    if (!email || !verifyToken(`unsub:${email}`, token)) {
      return res
        .status(400)
        .send(unsubscribeHtmlPage(false, "Lien invalide ou expiré."));
    }
    try {
      await storage.deleteLeadsByEmail(email);
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Unsubscribe failed:", e);
      }
      return res
        .status(500)
        .send(unsubscribeHtmlPage(false, "Erreur technique. Réessaie plus tard ou contacte hello@finksmart.com."));
    }
    return res.send(unsubscribeHtmlPage(true));
  });

  app.post("/api/send-report", sendReportLimiter, async (req, res) => {
    try {
      const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || null;
      const parsed = saveReportSchema.parse(req.body);
      // Defensive sanitization on user-controlled string fields that flow
      // into HTML/email templates.
      const data = {
        ...parsed,
        name: sanitizeName(parsed.name),
        email: parsed.email.trim().toLowerCase().slice(0, 254),
      };
      // Use the client-provided permalink if available — it contains the
      // full Phase 1 + Phase 2 query string. Fall back to the legacy
      // /report/:id route otherwise.
      const reportUrl = data.reportUrl
        || (data.calculationId
          ? `${req.protocol}://${req.get("host")}/report/${data.calculationId}?token=${signId(data.calculationId)}`
          : undefined);

      resolveIpLocation(ipAddress).then((ipLocation) => {
        storage.createLead({
          calculationId: data.calculationId,
          name: data.name,
          email: data.email,
          whatsapp: null,
          country: data.country,
          currency: data.currency,
          gapPercent: data.gapPercent,
          freedomScore: data.freedomScore,
          // Differentiate the lead status: did this user have the DNA result
          // when they asked for the report?
          leadStatus: data.climate ? "report_requested_with_dna" : "report_requested",
          ipAddress,
          ipLocation,
        }).catch((err) => {
          if (process.env.NODE_ENV !== "production") {
            console.error("Failed to create lead from report request:", err);
          }
        });
      });

      const emailSent = await sendReportEmail({
        recipientEmail: data.email,
        recipientName: data.name,
        freedomScore: data.freedomScore,
        freedomAge: data.freedomAge,
        targetAge: data.targetAge,
        gapPercent: data.gapPercent,
        requiredCapital: data.requiredCapital,
        plannedCapital: data.plannedCapital,
        country: data.country,
        currency: data.currency,
        currencySymbol: data.currencySymbol,
        age: data.age,
        monthlyIncome: data.monthlyIncome,
        desiredMonthlyIncome: data.desiredMonthlyIncome,
        monthlySavingsRate: data.monthlySavingsRate,
        currentSavings: data.currentSavings,
        personality: data.personality,
        narrativeType: data.narrativeType,
        reportUrl,
        retakeUrl: data.retakeUrl ?? undefined,
        riskDnaUrl: data.riskDnaUrl ?? undefined,
        unsubscribeUrl: buildUnsubscribeUrl(req, data.email),
        climate: data.climate ?? null,
        climateName: data.climateName ?? null,
        climateReturn: data.climateReturn ?? null,
        climateAdvice1: data.climateAdvice1 ?? null,
        climateAdvice2: data.climateAdvice2 ?? null,
        climateAdvice3: data.climateAdvice3 ?? null,
        allocBonds: data.allocBonds ?? null,
        allocEquity: data.allocEquity ?? null,
        allocAlt: data.allocAlt ?? null,
        dnaScore: data.dnaScore ?? null,
      });

      if (emailSent) {
        res.json({ success: true, message: "Report sent to your email" });
      } else {
        res.status(500).json({ error: "Failed to send email. Please try again." });
      }
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Send report error:", e);
      }
      if (e instanceof ZodError) {
        res.status(400).json({ error: "Invalid data" });
      } else {
        res.status(500).json({ error: "Failed to send report" });
      }
    }
  });

  return httpServer;
}
