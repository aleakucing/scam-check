import postgres from "postgres";
import { CaseRecord, createAccessToken } from "./types";

type SqlClient = ReturnType<typeof postgres>;

let client: SqlClient | null = null;
let initPromise: Promise<void> | null = null;

function connectionString(): string {
  const url = (process.env.DATABASE_URL || "").trim();
  if (!url) throw new Error("DATABASE_URL is required when the Postgres driver is selected.");
  return url;
}

function isLocalConnection(url: string): boolean {
  return (
    process.env.DATABASE_SSL === "disable" ||
    /(^|@)(localhost|127\.0\.0\.1|host\.docker\.internal)([:/]|$)/.test(url)
  );
}

function getClient(): SqlClient {
  if (!client) {
    const url = connectionString();
    client = postgres(url, {
      ssl: isLocalConnection(url) ? false : "require",
      max: Number(process.env.DATABASE_POOL_MAX || 5),
      idle_timeout: 20,
      connect_timeout: 10,
      // Keep Render logs quiet: CREATE TABLE IF NOT EXISTS emits a NOTICE each boot.
      onnotice: () => {},
      // Required when connecting through Supabase/PgBouncer in transaction mode.
      prepare: false
    });
  }
  return client;
}

export function initDb(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const sql = getClient();
      await sql`
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
      `;
      await sql`ALTER TABLE cases ADD COLUMN IF NOT EXISTS access_token TEXT`;
      await sql`ALTER TABLE cases ADD COLUMN IF NOT EXISTS categories TEXT DEFAULT '[]'`;
      await sql`ALTER TABLE cases ADD COLUMN IF NOT EXISTS source_model TEXT DEFAULT ''`;
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export async function pingDb(): Promise<void> {
  await initDb();
  await getClient()`SELECT 1`;
}

export async function saveCase(
  data: Partial<CaseRecord>
): Promise<{ case_id: string; access_token: string }> {
  await initDb();

  const caseId = data.case_id;
  if (!caseId) throw new Error("case_id is required");

  const nowIso = new Date().toISOString();
  const indicatorsJson = JSON.stringify(data.indicators || []);
  const actionsJson = JSON.stringify(data.actions || []);
  const categoriesJson = JSON.stringify(data.categories || []);
  const accessToken = data.access_token || createAccessToken();

  const openedLink = data.opened_link === true ? 1 : data.opened_link === false ? 0 : null;
  const enteredCreds =
    data.entered_credentials === true ? 1 : data.entered_credentials === false ? 0 : null;
  const enteredOtp = data.entered_otp === true ? 1 : data.entered_otp === false ? 0 : null;
  const isEmergency = data.is_emergency ? 1 : 0;

  const rows = await getClient()`
    INSERT INTO cases (
      case_id, timestamp, evidence_type, evidence_content,
      content_risk, confidence, user_exposure, risk_level,
      summary, indicators, actions, opened_link, entered_credentials,
      entered_otp, is_emergency, categories, source_model, access_token,
      created_at, updated_at
    ) VALUES (
      ${caseId}, ${data.timestamp || nowIso}, ${data.evidence_type || "url"},
      ${data.evidence_content || ""}, ${data.content_risk ?? 0}, ${data.confidence ?? 0},
      ${data.user_exposure ?? 10}, ${data.risk_level || "MENENGAH"},
      ${data.summary || ""}, ${indicatorsJson}, ${actionsJson},
      ${openedLink}, ${enteredCreds}, ${enteredOtp}, ${isEmergency},
      ${categoriesJson}, ${data.source_model || ""}, ${accessToken},
      ${nowIso}, ${nowIso}
    )
    ON CONFLICT (case_id) DO UPDATE SET
      user_exposure = EXCLUDED.user_exposure,
      opened_link = COALESCE(EXCLUDED.opened_link, cases.opened_link),
      entered_credentials = COALESCE(EXCLUDED.entered_credentials, cases.entered_credentials),
      entered_otp = COALESCE(EXCLUDED.entered_otp, cases.entered_otp),
      is_emergency = EXCLUDED.is_emergency,
      actions = EXCLUDED.actions,
      categories = CASE WHEN EXCLUDED.categories != '[]' THEN EXCLUDED.categories ELSE cases.categories END,
      source_model = CASE WHEN EXCLUDED.source_model != '' THEN EXCLUDED.source_model ELSE cases.source_model END,
      access_token = COALESCE(cases.access_token, EXCLUDED.access_token),
      updated_at = EXCLUDED.updated_at
    RETURNING access_token
  `;

  const stored = rows[0] as { access_token: string } | undefined;
  return { case_id: caseId, access_token: stored?.access_token || accessToken };
}

export async function getCase(caseId: string): Promise<any | null> {
  await initDb();

  const rows = await getClient()`
    SELECT * FROM cases WHERE case_id = ${caseId} LIMIT 1
  `;
  const row = rows[0] as any;
  if (!row) return null;

  return {
    ...row,
    indicators: JSON.parse(row.indicators || "[]"),
    actions: JSON.parse(row.actions || "[]"),
    categories: JSON.parse(row.categories || "[]"),
    opened_link: row.opened_link !== null ? Boolean(row.opened_link) : null,
    entered_credentials:
      row.entered_credentials !== null ? Boolean(row.entered_credentials) : null,
    entered_otp: row.entered_otp !== null ? Boolean(row.entered_otp) : null,
    is_emergency: Boolean(row.is_emergency)
  };
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.end({ timeout: 5 });
    client = null;
    initPromise = null;
  }
}
