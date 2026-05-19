/**
 * Vercel serverless entry — every /api/* request lands here.
 *
 * We build the Express app once per warm container and reuse it across
 * invocations (Vercel keeps the function instance alive between requests
 * when there's traffic, so this acts as a connection-pool / config cache).
 *
 * Static SPA assets are served by Vercel's edge from dist/public — they
 * never reach this handler, which is why we pass skipStatic:true.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Express } from "express";
import { createApp } from "../server/app.js";

let appPromise: Promise<Express> | null = null;
function getApp(): Promise<Express> {
  if (!appPromise) {
    appPromise = createApp({ skipStatic: true });
  }
  return appPromise;
}

export const config = {
  // Use Node.js (not the Edge runtime — we need pg + helmet + the full
  // express ecosystem). 30s timeout is plenty for our DB writes / Resend
  // calls; the platform's default is 10s for hobby and 60s for pro.
  maxDuration: 30,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getApp();
  // Express is callable as a request handler — pipe the Vercel req/res
  // through it. Types are compatible enough that the cast is safe.
  app(req as unknown as Parameters<Express>[0], res as unknown as Parameters<Express>[1]);
}
