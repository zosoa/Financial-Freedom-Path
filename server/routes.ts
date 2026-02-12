import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCalculationSchema, insertLeadSchema, SUPPORTED_CURRENCIES } from "@shared/schema";
import { ZodError } from "zod";
import { z } from "zod";
import { sendReportEmail, sendLeadConfirmationEmail } from "./email";

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
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/calculations", async (req, res) => {
    try {
      const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || null;
      const data = insertCalculationSchema.parse(req.body);
      const calculation = await storage.createCalculation({ ...data, ipAddress });
      res.json(calculation);
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({ error: "Invalid data", details: e.errors });
      } else {
        res.status(500).json({ error: "Failed to save calculation" });
      }
    }
  });

  app.get("/api/calculations/:id", async (req, res) => {
    try {
      const calculation = await storage.getCalculation(req.params.id);
      if (!calculation) {
        return res.status(404).json({ error: "Calculation not found" });
      }
      res.json(calculation);
    } catch (e) {
      res.status(500).json({ error: "Failed to get calculation" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || null;
      const data = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead({ ...data, ipAddress });

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
              reportUrl: `${req.protocol}://${req.get("host")}/report/${calc.id}`,
            };
          }
        }

        sendLeadConfirmationEmail({
          recipientEmail: data.email,
          recipientName: data.name,
          freedomScore: data.freedomScore ?? 0,
          gapPercent: data.gapPercent ?? 0,
          ...calcData,
        }).catch((err) => console.error("Lead confirmation email failed:", err));
      }

      res.json(lead);
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({ error: "Invalid data", details: e.errors });
      } else {
        res.status(500).json({ error: "Failed to save lead" });
      }
    }
  });

  app.post("/api/send-report", async (req, res) => {
    try {
      const data = saveReportSchema.parse(req.body);
      const reportUrl = data.calculationId
        ? `${req.protocol}://${req.get("host")}/report/${data.calculationId}`
        : undefined;

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
      });

      if (emailSent) {
        res.json({ success: true, message: "Report sent to your email" });
      } else {
        res.status(500).json({ error: "Failed to send email. Please try again." });
      }
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({ error: "Invalid data", details: e.errors });
      } else {
        res.status(500).json({ error: "Failed to send report" });
      }
    }
  });

  return httpServer;
}
