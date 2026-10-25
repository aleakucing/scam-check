import { serveStatic } from "hono/bun";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { app } from "./app";
import { config } from "./config";
import { getCaseStore, isPostgres } from "./db/caseStore";
import { setStore } from "./db/activeStore";

// Bun/VPS entry point. Vercel uses the root `server.ts` instead, so none of
// the Bun-only imports above are pulled into the serverless bundle.

process.on("unhandledRejection", (reason) => {
  console.warn("[KrosCheck Warning] Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[KrosCheck Critical] Uncaught Exception caught:", err);
});

const store = await getCaseStore();
setStore(store, isPostgres ? "postgres" : "sqlite");

const candidates = [
  resolve(import.meta.dir, "../../frontend/dist"),
  resolve(import.meta.dir, "../frontend/dist"),
  resolve(process.cwd(), "../frontend/dist"),
  resolve(process.cwd(), "./dist"),
  "/usr/share/nginx/html"
];
const distPath = candidates.find((p) => existsSync(p)) || resolve(import.meta.dir, "../../frontend/dist");
const distIndexHtml = resolve(distPath, "index.html");

// Serve static assets from frontend dist if available (Bun/VPS/local only).
if (existsSync(distPath)) {
  app.use("/assets/*", serveStatic({ root: distPath }));
}

// Root status / SPA entry
app.get("/", async (c) => {
  if (c.req.header("accept")?.includes("text/html") && existsSync(distIndexHtml)) {
    return c.html(readFileSync(distIndexHtml, "utf8"));
  }
  return c.json({
    status: "online",
    service: config.PROJECT_NAME,
    version: config.VERSION,
    runtime: `Bun ${Bun.version}`,
    docs_url: "/api/health"
  });
});

const spaRoutes = [
  "/result",
  "/riwayat",
  "/history",
  "/how-it-works",
  "/faq",
  "/download",
  "/trends",
  "/about",
  "/privacy",
  "/terms",
  "/coming-soon"
];

for (const route of spaRoutes) {
  app.get(route, async (c) => {
    if (existsSync(distIndexHtml)) {
      return c.html(readFileSync(distIndexHtml, "utf8"));
    }
    return c.json({ status: `${route} page` });
  });
}

app.get("/hasil/:caseId", async (c) => {
  if (existsSync(distIndexHtml)) {
    return c.html(readFileSync(distIndexHtml, "utf8"));
  }
  return c.json({ status: "hasil page" });
});

console.log(`[KrosCheck] Server running at http://${config.HOST}:${config.PORT}`);

export default {
  port: config.PORT,
  hostname: config.HOST,
  fetch: app.fetch
};

export { app };
