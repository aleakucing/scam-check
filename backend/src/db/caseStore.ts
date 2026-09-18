import { Database } from "bun:sqlite";
import { dirname } from "path";
import { mkdirSync } from "fs";
import { config } from "../config";

export interface CaseRecord {
  case_id: string;
  timestamp?: string;
  evidence_type?: string;
  evidence_content?: string;
  content_risk?: number;
  confidence?: number;
  user_exposure?: number;
  risk_level?: string;
  summary?: string;
  indicators?: any[];
  actions?: any[];
  opened_link?: boolean | null;
  entered_credentials?: boolean | null;
  entered_otp?: boolean | null;
  is_emergency?: boolean;
  created_at?: string;
  updated_at?: string;
}

mkdirSync(dirname(config.DATABASE_PATH), { recursive: true });
export const db = new Database(config.DATABASE_PATH, { create: true });

export function initDb() {
  db.run(`
    CREATE TABLE IF NOT EXISTS cases (
      case_id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      evidence_type TEXT NOT NULL,
      evidence_content TEXT NOT NULL,
      content_risk INTEGER NOT NULL,
      confidence INTEGER NOT NULL,
      user_exposure INTEGER DEFAULT 10,
      risk_level TEXT NOT NULL,
      summary TEXT NOT NULL,
      indicators TEXT NOT NULL,
      actions TEXT DEFAULT '[]',
      opened_link INTEGER DEFAULT NULL,
      entered_credentials INTEGER DEFAULT NULL,
      entered_otp INTEGER DEFAULT NULL,
      is_emergency INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
}

initDb();

export function saveCase(data: Partial<CaseRecord>): string {
  const caseId = data.case_id;
  if (!caseId) throw new Error("case_id is required");

  const nowIso = new Date().toISOString();
  const indicatorsJson = JSON.stringify(data.indicators || []);
  const actionsJson = JSON.stringify(data.actions || []);

  const openedLink = data.opened_link === true ? 1 : data.opened_link === false ? 0 : null;
  const enteredCreds = data.entered_credentials === true ? 1 : data.entered_credentials === false ? 0 : null;
  const enteredOtp = data.entered_otp === true ? 1 : data.entered_otp === false ? 0 : null;
  const isEmergency = data.is_emergency ? 1 : 0;

  const stmt = db.prepare(`
    INSERT INTO cases (
      case_id, timestamp, evidence_type, evidence_content,
      content_risk, confidence, user_exposure, risk_level,
      summary, indicators, actions, opened_link, entered_credentials,
      entered_otp, is_emergency, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(case_id) DO UPDATE SET
      user_exposure = excluded.user_exposure,
      opened_link = COALESCE(excluded.opened_link, cases.opened_link),
      entered_credentials = COALESCE(excluded.entered_credentials, cases.entered_credentials),
      entered_otp = COALESCE(excluded.entered_otp, cases.entered_otp),
      is_emergency = excluded.is_emergency,
      actions = excluded.actions,
      updated_at = excluded.updated_at
  `);

  stmt.run(
    caseId,
    data.timestamp || nowIso,
    data.evidence_type || "url",
    data.evidence_content || "",
    data.content_risk ?? 0,
    data.confidence ?? 0,
    data.user_exposure ?? 10,
    data.risk_level || "MENENGAH",
    data.summary || "",
    indicatorsJson,
    actionsJson,
    openedLink,
    enteredCreds,
    enteredOtp,
    isEmergency,
    nowIso,
    nowIso
  );

  return caseId;
}

export function getCase(caseId: string): any | null {
  const stmt = db.prepare("SELECT * FROM cases WHERE case_id = ?");
  const row: any = stmt.get(caseId);
  if (!row) return null;

  return {
    ...row,
    indicators: JSON.parse(row.indicators || "[]"),
    actions: JSON.parse(row.actions || "[]"),
    opened_link: row.opened_link !== null ? Boolean(row.opened_link) : null,
    entered_credentials: row.entered_credentials !== null ? Boolean(row.entered_credentials) : null,
    entered_otp: row.entered_otp !== null ? Boolean(row.entered_otp) : null,
    is_emergency: Boolean(row.is_emergency)
  };
}

export function listRecentCases(limit: number = 15): any[] {
  const stmt = db.prepare(`
    SELECT case_id, timestamp, evidence_type, content_risk, 
           confidence, user_exposure, risk_level, summary, 
           is_emergency, created_at
    FROM cases 
    ORDER BY created_at DESC 
    LIMIT ?
  `);
  return stmt.all(limit);
}
