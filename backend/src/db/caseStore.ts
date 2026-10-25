import * as sqlite from "./sqliteStore";
import * as pg from "./pgStore";
import type { CaseRecord } from "./types";

/**
 * The storage driver is selected at runtime:
 * - DATABASE_URL present  -> Postgres (Supabase / Neon / any Postgres)
 * - DATABASE_URL absent   -> local SQLite file (VPS / local development)
 *
 * Both drivers expose the same async-friendly surface so the HTTP layer does
 * not need to know which database is behind it.
 */
export const isPostgres = Boolean((process.env.DATABASE_URL || "").trim());
const store = isPostgres ? pg : sqlite;

export async function saveCase(
  data: Partial<CaseRecord>
): Promise<{ case_id: string; access_token: string }> {
  return store.saveCase(data);
}

export async function getCase(caseId: string): Promise<any | null> {
  return store.getCase(caseId);
}

export async function pingDb(): Promise<void> {
  await store.pingDb();
}

export { accessGranted } from "./types";
export type { CaseRecord } from "./types";
