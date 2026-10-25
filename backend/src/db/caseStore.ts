import type { CaseStore } from "./store";

/**
 * Selects the storage driver once per process:
 * - DATABASE_URL present  -> Postgres (Supabase / Neon / any Postgres)
 * - DATABASE_URL absent   -> local SQLite file (VPS / local development)
 *
 * Only the Bun/VPS entry imports this module. The Vercel entry imports
 * `pgStore` directly, so `bun:sqlite` is never part of the serverless bundle.
 */
export const isPostgres = Boolean((process.env.DATABASE_URL || "").trim());

let storePromise: Promise<CaseStore> | null = null;

export function getCaseStore(): Promise<CaseStore> {
  if (!storePromise) {
    storePromise = (isPostgres ? import("./pgStore") : import("./sqliteStore")).then(
      (mod) => mod as unknown as CaseStore
    );
  }
  return storePromise;
}

export { accessGranted } from "./types";
export type { CaseRecord } from "./types";
