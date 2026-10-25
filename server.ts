import { Hono } from "hono";
import { app as kroscheckApp } from "./backend/src/app";
import { setStore } from "./backend/src/db/activeStore";
import * as pgStore from "./backend/src/db/pgStore";

// Vercel's zero-config Hono preset looks for app.ts / index.ts / server.ts.
// This entry is only used by Vercel; the Bun/VPS entry lives in backend/src.
setStore(pgStore, "postgres");

// Keep a direct Hono import in this entry so Vercel's zero-config Hono
// detector recognizes the project. The app itself is the shared instance.
void Hono;

const app = kroscheckApp;

export default app;
