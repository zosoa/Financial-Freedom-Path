/**
 * Long-running server entry — used by Replit deployments and local `npm run dev`.
 * Vercel does not import this file; it uses api/[...path].ts instead.
 *
 * Setup lives in server/app.ts so the same configuration is reused
 * between the two entry points.
 */
import { createServer } from "http";
import { createApp } from "./app";
import { log } from "./log";

(async () => {
  // In production we want serveStatic to handle the SPA. In dev we want Vite's
  // middleware. createApp() handles the prod case; dev wires Vite below.
  const app = await createApp();
  const httpServer = createServer(app);

  if (process.env.NODE_ENV !== "production") {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

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
