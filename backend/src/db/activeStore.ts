import type { CaseRecord } from "./types";
import type { CaseStore, DatabaseDriver } from "./store";

/**
 * The HTTP app is a module-level singleton. Each runtime entry point sets the
 * storage driver before exporting/serving the app:
 *
 * - `backend/src/index.ts` (Bun/VPS) -> SQLite or Postgres via DATABASE_URL
 * - `server.ts` (Vercel)            -> Postgres only
 *
 * Keeping this indirection here means `app.ts` never imports `bun:sqlite`,
 * `hono/bun`, or any other Bun-only module, so Vercel can bundle it for Node.
 */
let activeStore: CaseStore | null = null;
let activeDriver: DatabaseDriver = "sqlite";

export function setStore(store: CaseStore, driver: DatabaseDriver): void {
  activeStore = store;
  activeDriver = driver;
}

export function getDriver(): DatabaseDriver {
  return activeDriver;
}

function requireStore(): CaseStore {
  if (!activeStore) {
    throw new Error("Case store is not initialized.");
  }
  return activeStore;
}

export async function saveCase(
  data: Partial<CaseRecord>
): Promise<{ case_id: string; access_token: string }> {
  return requireStore().saveCase(data);
}

export async function getCase(caseId: string): Promise<any | null> {
  return requireStore().getCase(caseId);
}

export async function pingDb(): Promise<void> {
  await requireStore().pingDb();
}
