import type { CaseRecord } from "./types";

export type DatabaseDriver = "postgres" | "sqlite";

/**
 * Storage surface shared by the SQLite (Bun/VPS) and Postgres (Supabase/
 * Vercel) drivers. The HTTP layer only depends on this interface, so the
 * same app can run on a long-lived Bun server or on serverless Vercel.
 */
export interface CaseStore {
  saveCase(data: Partial<CaseRecord>): Promise<{ case_id: string; access_token: string }>;
  getCase(caseId: string): Promise<any | null>;
  pingDb(): Promise<void>;
}
