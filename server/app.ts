/**
 * Express app factory — shared between the long-running server (Replit /
 * local dev) and the Vercel serverless handler (api/[...path].ts).
 *
 * No httpServer, no listen(). Just middleware + routes + error handler.
 * Whoever imports it decides how to expose it (httpServer.listen, or
 * pipe it through Vercel's req/res).
 */
import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import { createServer, type Server } from "http";
import { registerRoutes } from "./routes.js";
import { log } from "./log.js";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

const isProduction = process.env.NODE_ENV === "production";

/* ============== Boot-time security assertions ==============
 * Refuse to start in production without the secrets the app needs to
 * sign tokens. The previous hard-coded fallback was a known constant
 * that would have made every issued token forgeable if the env var was
 * ever missing. Fail loud here, before any request is served. */
if (isProduction) {
  if (!process.env.SESSION_SECRET && !process.env.ID_TOKEN_SECRET) {
    throw new Error(
      "SESSION_SECRET (or ID_TOKEN_SECRET) must be set in production. Refusing to boot with a hard-coded fallback.",
    );
  }
}

/**
 * Build and configure the Express app. Idempotent — caller can cache the
 * result across Vercel serverless invocations.
 *
 * @param skipStatic when true, do NOT mount the static SPA serving. Use
 *   this on Vercel where the SPA is served directly by the edge from
 *   dist/public (much faster than going through Node).
 */
export async function createApp(opts: { skipStatic?: boolean } = {}) {
  const app = express();
  // Trust the platform proxy so req.ip / x-forwarded-for resolves correctly.
  app.set("trust proxy", 1);

  /* ============== Security middleware (must come first) ============== */

  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? {
            useDefaults: true,
            directives: {
              "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
              "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
              "img-src": ["'self'", "data:", "blob:", "https:"],
              "media-src": ["'self'", "blob:"],
              "script-src": ["'self'", "'unsafe-inline'"],
              "connect-src": ["'self'", "https://freeipapi.com", "https://api.resend.com"],
            },
          }
        : false,
      hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true } : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS — restrict cross-origin to our domains. Same-origin requests
  // (the SPA on finksmart.com calling /api/*) don't need CORS at all.
  //
  // We tightened the allow-list after migrating off Replit: previously we
  // accepted any *.replit.dev / *.replit.app / *.vercel.app origin, which
  // meant any user of those platforms could call /api/* with
  // `credentials: true`. Now only our own production + preview origins
  // are accepted.
  const allowedOrigins = [
    "https://finksmart.com",
    "https://www.finksmart.com",
  ];
  // Vercel preview deploys for THIS project look like
  // `https://finksmart-<hash>-zosoas-projects.vercel.app`. Match exactly
  // that shape — not a wildcard over the whole .vercel.app namespace.
  const VERCEL_PREVIEW_RE = /^https:\/\/finksmart-[a-z0-9]+-zosoas-projects\.vercel\.app$/;
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        if (VERCEL_PREVIEW_RE.test(origin)) return cb(null, true);
        return cb(new Error("Not allowed by CORS"), false);
      },
      credentials: true,
    }),
  );

  app.use(
    express.json({
      limit: "10kb",
      verify: (req, _res, buf) => {
        (req as any).rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: false, limit: "10kb" }));

  /* ============== Request logging ==============
   * In dev we capture the JSON response body for debugging. In production
   * we NEVER do — PII (email, name, WhatsApp, financial numbers, signed
   * read tokens) was being written to Vercel's log stream on every
   * /api/* request, which is the wrong lawful basis under GDPR. */
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    if (!isProduction) {
      const originalResJson = res.json;
      res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
      };
    }

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse && !isProduction) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        log(logLine);
      }
    });

    next();
  });

  /* ============== Routes ============== */
  // We pass a noop server reference — registerRoutes' signature requires
  // it but the current implementation doesn't actually use it for anything
  // here (no websocket / SSE attached to the http server).
  const noopServer = createServer();
  await registerRoutes(noopServer as Server, app);

  /* ============== Error handler (must be last) ============== */

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = isProduction
      ? status === 400
        ? err.message || "Bad request"
        : "Internal Server Error"
      : err.message || "Internal Server Error";

    if (isProduction) {
      console.error(`[${status}] ${err.message || "unknown error"}`);
    } else {
      console.error("Internal Server Error:", err);
    }

    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });

  /* ============== Static SPA (Replit / local prod only) ============== */
  // On Vercel, dist/public is served by the edge — never call serveStatic
  // there or every static asset would round-trip through the Node function.
  if (!opts.skipStatic && isProduction) {
    const { serveStatic } = await import("./static.js");
    serveStatic(app);
  }

  return app;
}
