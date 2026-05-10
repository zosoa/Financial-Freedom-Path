import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

/* ============== Security middleware (must come first) ============== */

// Security headers — CSP relaxed in dev to keep Vite HMR working.
const isProduction = process.env.NODE_ENV === "production";
app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? {
          useDefaults: true,
          directives: {
            // Allow inline styles (Tailwind/Radix uses style attributes) and Google Fonts.
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
            "img-src": ["'self'", "data:", "blob:", "https:"],
            // Recharts + framer-motion need inline style; Replit cartographer dev banner is dev-only.
            "script-src": ["'self'", "'unsafe-inline'"],
            "connect-src": ["'self'", "https://freeipapi.com", "https://api.resend.com"],
          },
        }
      : false,
    // HSTS only useful behind HTTPS — Replit/Vercel terminate TLS for us.
    hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true } : false,
    crossOriginEmbedderPolicy: false, // would block external images
  }),
);

// CORS — restrict cross-origin to our domains. Same-origin requests
// (the SPA on finksmart.com calling /api/*) don't need CORS.
const allowedOrigins = [
  "https://finksmart.com",
  "https://www.finksmart.com",
  "https://financial-freedom-path.replit.app",
  // Replit dev domain — pattern for any janeway.replit.dev subdomain.
];
app.use(
  cors({
    origin: (origin, cb) => {
      // No origin = same-origin / curl / server-to-server → allow.
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      if (/\.replit\.(dev|app|co)$/.test(new URL(origin).hostname)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  }),
);

// Body size limit — our payloads are < 2 KB, 10 KB is plenty and stops DoS.
app.use(
  express.json({
    limit: "10kb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "10kb" }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    // Generic message in production — never leak internals.
    const message = isProduction
      ? status === 400
        ? err.message || "Bad request"
        : "Internal Server Error"
      : err.message || "Internal Server Error";

    // Log only the message in production; full stack only in dev.
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

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
