import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import crypto from "node:crypto";
import rateLimit from "express-rate-limit";
import { storage } from "./storage.js";
import { COUNTRY_CURRENCY_MAP, SUPPORTED_CURRENCIES } from "../shared/schema.js";
import { ZodError } from "zod";
import { z } from "zod";
import { sendReportEmail, sendLeadConfirmationEmail } from "./email.js";

/* ============================================================
 * Helpers
 * ============================================================ */

// In production server/app.ts asserts SESSION_SECRET is set before we
// even load this module. The "" fallback here is dev-only and means
// "no secret configured" — we'd rather get a different per-process
// random fallback than a published constant string.
const ID_TOKEN_SECRET =
  process.env.SESSION_SECRET ||
  process.env.ID_TOKEN_SECRET ||
  crypto.randomBytes(32).toString("hex");

/** Sign an arbitrary string with HMAC-SHA256. Returns the full 32-char
 *  (128-bit) hex prefix — full HMAC tag is 64 chars but the URL needs to
 *  stay short. 128 bits leaves no practical truncation-collision window
 *  and matches the entropy of a UUID-as-secret. Used for read-back and
 *  unsubscribe URLs so we don't expose other people's data. */
function signId(id: string): string {
  return crypto
    .createHmac("sha256", ID_TOKEN_SECRET)
    .update(id)
    .digest("hex")
    .slice(0, 32);
}

/** Accept tokens at the new 32-char length AND the legacy 16-char length
 *  for a deprecation window — old email links and read URLs already in
 *  flight (sent before the bump) need to keep working. After ~90 days
 *  the 16-char branch can be removed. */
function verifyToken(id: string, token: string | undefined): boolean {
  if (!token || (token.length !== 32 && token.length !== 16)) return false;
  const expectedFull = signId(id);
  const expected = expectedFull.slice(0, token.length);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(token, "hex"),
    );
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

/* Admin auth middleware — check for valid ADMIN_KEY */
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    return res.status(500).json({ error: "Admin key not configured" });
  }

  const keyParam = req.query.key;
  const keyHeader = req.get("x-admin-key");
  const providedKey = typeof keyParam === "string" ? keyParam : keyHeader;

  if (!providedKey || providedKey !== adminKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

/* freeipapi cache — keyed by clean IP, valid for an hour. Same IP
 * repeatedly submitting the form (a common pattern from one office /
 * household) shouldn't re-hit the upstream every time. Bounded to 5000
 * entries to defeat memory exhaustion from random-IP traffic. */
const IP_CACHE = new Map<string, { value: string | null; expires: number }>();
const IP_CACHE_TTL_MS = 60 * 60 * 1000;
const IP_CACHE_MAX = 5000;

/** Only the well-formed shape we use from the upstream payload. */
function isValidIpRecord(x: unknown): x is { countryName?: string; cityName?: string; regionName?: string } {
  return typeof x === "object" && x !== null;
}

async function resolveIpLocation(ip: string | null): Promise<string | null> {
  if (!ip || ip === "::1" || ip === "127.0.0.1" || ip === "::ffff:127.0.0.1") return null;
  const cleanIp = ip.replace(/^::ffff:/, "");
  const now = Date.now();
  const cached = IP_CACHE.get(cleanIp);
  if (cached && cached.expires > now) return cached.value;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  let value: string | null = null;
  try {
    const res = await fetch(`https://freeipapi.com/api/json/${encodeURIComponent(cleanIp)}`, {
      signal: controller.signal,
      // Don't follow redirects: a redirect from a third-party API
      // could be aimed at an internal IP (SSRF-adjacent risk).
      redirect: "error",
    });
    if (res.ok) {
      // Cap the response body to 16 KB to defeat a malicious upstream
      // trying to fill our function memory with a huge JSON payload.
      const buf = await res.arrayBuffer();
      if (buf.byteLength <= 16 * 1024) {
        try {
          const data = JSON.parse(new TextDecoder().decode(buf));
          if (isValidIpRecord(data) && data.countryName) {
            const parts = [data.cityName, data.regionName, data.countryName].filter(Boolean);
            value = parts.join(", ") || null;
          }
        } catch { /* malformed JSON — fall through to null */ }
      }
    }
  } catch {
    // network error / abort / redirect rejection — treat as unknown.
    value = null;
  } finally {
    clearTimeout(timeout);
  }

  // Evict oldest entry if we hit the cap (rough LRU — Maps preserve
  // insertion order so the first key is the oldest).
  if (IP_CACHE.size >= IP_CACHE_MAX) {
    const oldest = IP_CACHE.keys().next().value;
    if (oldest !== undefined) IP_CACHE.delete(oldest);
  }
  IP_CACHE.set(cleanIp, { value, expires: now + IP_CACHE_TTL_MS });
  return value;
}

/* ============================================================
 * Input schemas — explicit allow-listed fields, bounded ranges.
 *
 * Generating these from `createInsertSchema(calculations)` (which is
 * what we did before) exposes server-managed columns to mass assignment:
 * `ipAddress`, `ipLocation`, `referralSource`, `leadStatus`, `sessionId`,
 * `calculationId` were all accepted from the request body. Some are
 * server-derived and shouldn't be trusted from the client; others
 * needed bounded validation. These hand-written schemas list exactly
 * what the client is allowed to send, with explicit bounds on every
 * numeric field.
 * ============================================================ */

const KNOWN_COUNTRY = z
  .string()
  .min(1)
  .max(80)
  .refine((c) => c in COUNTRY_CURRENCY_MAP, { message: "Unknown country" });
const KNOWN_CURRENCY = z
  .string()
  .length(3)
  .refine((c) => c in SUPPORTED_CURRENCIES, { message: "Unknown currency" });
const SAFE_MONEY = z.number().finite().min(0).max(1e12);
const SAFE_AGE = z.number().int().min(0).max(120);
const SAFE_PCT = z.number().finite().min(0).max(100);
const SAFE_STR_80 = z.string().max(80);

const calculationInputSchema = z.object({
  country: KNOWN_COUNTRY,
  currency: KNOWN_CURRENCY,
  age: SAFE_AGE,
  monthlyIncome: SAFE_MONEY,
  desiredMonthlyIncome: SAFE_MONEY,
  currentSavings: SAFE_MONEY,
  monthlySavingsRate: SAFE_MONEY,
  targetFreedomAge: SAFE_AGE.default(55),
  expectedLumpSum: SAFE_MONEY.default(0),
  lumpSumAge: SAFE_AGE.nullable().optional(),
  annualReturn: z.number().finite().min(-10).max(50).default(7),
  requiredCapital: SAFE_MONEY,
  plannedCapital: SAFE_MONEY,
  gapPercent: SAFE_PCT,
  freedomAge: z.number().int().min(0).max(200),
  freedomScore: z.number().int().min(0).max(100),
  solutionSaveMore: SAFE_MONEY.nullable().optional(),
  solutionLumpSum: SAFE_MONEY.nullable().optional(),
  solutionReturnNeeded: z.number().finite().min(-10).max(100).nullable().optional(),
  // Analytics — bounded strings. ipAddress / ipLocation / referralSource
  // (the row column) are server-set; we accept a *client-side* referral
  // string here but write it to the same column.
  sessionId: SAFE_STR_80.nullable().optional(),
  referralSource: z.string().max(40).nullable().optional(),
});

/** Lead statuses the server itself promotes the row to. We accept a
 *  subset from the client (lifecycle states) but reject anything else
 *  to prevent advisor-pipeline spoofing. */
const CLIENT_LEAD_STATUS = z.enum([
  "lead",
  "phase1_complete",
  "report_requested",
  "report_requested_with_dna",
  "matching_requested",
  "risk_dna_started",
]);

const leadInputSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(254).nullable().optional(),
  whatsapp: z.string().max(40).nullable().optional(),
  country: KNOWN_COUNTRY,
  currency: KNOWN_CURRENCY,
  calculationId: z.string().uuid().nullable().optional(),
  lifeEvent: SAFE_STR_80.nullable().optional(),
  // `freedomScore` and `gapPercent` are accepted as a fallback if
  // `calculationId` is null, but server-side derivation from the linked
  // calculation row takes precedence when calculationId is set.
  freedomScore: z.number().int().min(0).max(100).optional(),
  gapPercent: SAFE_PCT.optional(),
  // Analytics — bounded.
  sessionId: SAFE_STR_80.nullable().optional(),
  referralSource: z.string().max(40).nullable().optional(),
  leadStatus: CLIENT_LEAD_STATUS.optional(),
});

const saveReportSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().min(1).max(80),
  calculationId: z.string().uuid().nullable(),
  freedomScore: z.number().int().min(0).max(100),
  freedomAge: z.number().int().min(0).max(200),
  targetAge: SAFE_AGE,
  gapPercent: SAFE_PCT,
  requiredCapital: SAFE_MONEY,
  plannedCapital: SAFE_MONEY,
  country: KNOWN_COUNTRY,
  currency: KNOWN_CURRENCY,
  currencySymbol: z.string().max(8),
  age: SAFE_AGE,
  monthlyIncome: SAFE_MONEY,
  desiredMonthlyIncome: SAFE_MONEY,
  monthlySavingsRate: SAFE_MONEY,
  currentSavings: SAFE_MONEY,
  personality: SAFE_STR_80,
  narrativeType: SAFE_STR_80,
  /* Phase 2 — Risk DNA (optional, included only if user has done it). */
  climate: z.enum(["glacier", "tempere", "tropical", "volcan"]).nullable().optional(),
  climateName: SAFE_STR_80.nullable().optional(),
  climateReturn: z.number().finite().min(-10).max(100).nullable().optional(),
  climateAdvice1: z.string().max(500).nullable().optional(),
  climateAdvice2: z.string().max(500).nullable().optional(),
  climateAdvice3: z.string().max(500).nullable().optional(),
  allocBonds: SAFE_PCT.nullable().optional(),
  allocEquity: SAFE_PCT.nullable().optional(),
  allocAlt: SAFE_PCT.nullable().optional(),
  dnaScore: z.number().int().min(0).max(100).nullable().optional(),
  /* Real-world working URLs surfaced in the email body. Constrained to
   * a FinkSmart-controlled host so the email body can't be tricked into
   * pointing recipients elsewhere (phishing-via-our-domain). */
  reportUrl: safeFinkUrl().nullable().optional(),
  retakeUrl: safeFinkUrl().nullable().optional(),
  riskDnaUrl: safeFinkUrl().nullable().optional(),
});

/** Accept only URLs whose host is one of: finksmart.com, www.finksmart.com,
 *  localhost (for dev), or our Vercel preview pattern. Rejects any other
 *  host so client-controlled URLs can't sneak into outbound emails. */
function safeFinkUrl() {
  return z
    .string()
    .url()
    .max(2048)
    .refine(
      (u) => {
        try {
          const h = new URL(u).hostname;
          return (
            h === "finksmart.com" ||
            h === "www.finksmart.com" ||
            h === "localhost" ||
            h === "127.0.0.1" ||
            /^finksmart-[a-z0-9]+-zosoas-projects\.vercel\.app$/.test(h)
          );
        } catch {
          return false;
        }
      },
      { message: "URL must point to a FinkSmart-controlled host" },
    );
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/calculations", writeLimiter, async (req, res) => {
    try {
      // `req.ip` is the proxy-trusted value (we set trust proxy = 1 in
      // app.ts). Hand-parsing x-forwarded-for would accept caller-spoofed
      // headers and let attackers forge analytics IPs.
      const ipAddress = req.ip ?? null;
      const data = calculationInputSchema.parse(req.body);
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
      const ipAddress = req.ip ?? null;
      const raw = leadInputSchema.parse(req.body);
      // If the lead is linked to a calculation, derive the diagnostic
      // numbers from the calculation row server-side — never trust the
      // client's freedomScore / gapPercent for advisor-facing data.
      let derivedScore = raw.freedomScore ?? 0;
      let derivedGap = raw.gapPercent ?? 0;
      let linkedCalculation: Awaited<ReturnType<typeof storage.getCalculation>> | undefined;
      if (raw.calculationId) {
        linkedCalculation = await storage.getCalculation(raw.calculationId);
        if (linkedCalculation) {
          derivedScore = linkedCalculation.freedomScore;
          derivedGap = linkedCalculation.gapPercent;
        }
      }
      // Sanitize free-text fields before storing.
      const data = {
        name: sanitizeName(raw.name),
        email: raw.email ? raw.email.trim().toLowerCase().slice(0, 254) : null,
        whatsapp: raw.whatsapp ?? null,
        country: raw.country,
        currency: raw.currency,
        calculationId: raw.calculationId ?? null,
        gapPercent: derivedGap,
        freedomScore: derivedScore,
        leadStatus: raw.leadStatus ?? "lead",
        lifeEvent: raw.lifeEvent ?? null,
        referralSource: raw.referralSource ?? null,
        sessionId: raw.sessionId ?? null,
      };
      const ipLocation = await resolveIpLocation(ipAddress);
      const lead = await storage.createLead({ ...data, ipAddress, ipLocation });

      if (data.email && data.name) {
        let calcData: any = {};
        if (linkedCalculation) {
          const currencyInfo = SUPPORTED_CURRENCIES[linkedCalculation.currency];
          calcData = {
            freedomAge: linkedCalculation.freedomAge,
            targetAge: linkedCalculation.targetFreedomAge,
            requiredCapital: linkedCalculation.requiredCapital,
            plannedCapital: linkedCalculation.plannedCapital,
            age: linkedCalculation.age,
            currency: linkedCalculation.currency,
            currencySymbol: currencyInfo?.symbol || linkedCalculation.currency,
            desiredMonthlyIncome: linkedCalculation.desiredMonthlyIncome,
            reportUrl: `${req.protocol}://${req.get("host")}/report/${linkedCalculation.id}?token=${signId(linkedCalculation.id)}`,
          };
        }

        const unsubUrl = buildUnsubscribeUrl(req, data.email);
        sendLeadConfirmationEmail({
          recipientEmail: data.email,
          recipientName: data.name,
          freedomScore: derivedScore,
          gapPercent: derivedGap,
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
      const ipAddress = req.ip ?? null;
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

      // Derive freedomScore/gapPercent server-side from the linked
      // calculation when available, falling back to the (bounded) client
      // values only if the calculation row isn't found.
      const calcForLead = data.calculationId
        ? await storage.getCalculation(data.calculationId)
        : undefined;
      const leadScore = calcForLead?.freedomScore ?? data.freedomScore;
      const leadGap = calcForLead?.gapPercent ?? data.gapPercent;

      // Persist the lead synchronously so the client gets a real
      // success/failure signal — previously this was wrapped in
      // .then().catch() and the route returned 200 even if the row
      // never landed in the DB.
      const ipLocation = await resolveIpLocation(ipAddress);
      try {
        await storage.createLead({
          calculationId: data.calculationId,
          name: data.name,
          email: data.email,
          whatsapp: null,
          country: data.country,
          currency: data.currency,
          gapPercent: leadGap,
          freedomScore: leadScore,
          // Differentiate the lead status: did this user have the DNA result
          // when they asked for the report?
          leadStatus: data.climate ? "report_requested_with_dna" : "report_requested",
          ipAddress,
          ipLocation,
        });
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to create lead from report request:", err);
        }
        // Don't fail the whole request just because the lead couldn't be
        // recorded — email is the user-facing artifact. Log and continue.
      }

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

  /* Admin stats endpoint — requires valid ADMIN_KEY */
  app.get("/api/admin/stats", requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Admin stats error:", e);
      }
      res.status(500).json({ error: "Failed to retrieve admin stats" });
    }
  });

  return httpServer;
}
