import { timingSafeEqual } from "crypto";

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
  categories?: any[];
  source_model?: string;
  access_token?: string;
  created_at?: string;
  updated_at?: string;
}

export function createAccessToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("hex");
}

export function accessGranted(
  storedToken: string | undefined,
  providedToken: string | undefined
): boolean {
  const stored = storedToken || "";
  const provided = providedToken || "";
  if (!stored || !provided) return false;
  const storedBytes = Buffer.from(stored);
  const providedBytes = Buffer.from(provided);
  if (storedBytes.length !== providedBytes.length) return false;
  return timingSafeEqual(storedBytes, providedBytes);
}
