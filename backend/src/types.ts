export type EvidenceType = "url" | "text" | "screenshot" | "voice";

export interface Indicator {
  title: string;
  impact: "KRITIS" | "TINGGI" | "SEDANG" | "INFO" | "AMAN";
  level: "red" | "orange" | "green" | "blue";
  desc: string;
}

export interface CategoryScore {
  name: string;
  score: string;
}

export interface AnalyzeRequest {
  type?: EvidenceType;
  content: string;
  image_base64?: string;
}

export interface AnalyzeResponse {
  case_id: string;
  timestamp: string;
  content_risk: number;
  confidence: number;
  risk_level: string;
  summary: string;
  categories: CategoryScore[];
  indicators: Indicator[];
  initial_exposure: number;
  evidence_type: string;
  source_model: string;
}

export interface InterviewRequest {
  case_id: string;
  content_risk?: number;
  opened_link?: boolean | null;
  entered_credentials?: boolean | null;
  entered_otp?: boolean | null;
}

export interface ActionItem {
  step: number;
  title: string;
  desc: string;
  is_urgent: boolean;
}

export interface InterviewResponse {
  case_id: string;
  user_exposure: number;
  exposure_level: string;
  is_emergency: boolean;
  status_desc: string;
  emergency_title: string;
  emergency_subtitle: string;
  actions: ActionItem[];
  recommended_actions?: ActionItem[];
  timeline_event?: Record<string, any>;
}

export interface CaseReportRequest {
  case_id: string;
  content_risk: number;
  confidence: number;
  user_exposure: number;
  evidence_type: string;
  evidence_content: string;
  opened_link?: boolean | null;
  entered_credentials?: boolean | null;
  entered_otp?: boolean | null;
  indicators?: Indicator[];
}

export interface CaseReportResponse {
  case_id: string;
  formatted_text: string;
  masked_evidence: string;
}

export interface CaseRecord {
  case_id: string;
  timestamp: string;
  evidence_type: string;
  evidence_content: string;
  content_risk: number;
  confidence: number;
  user_exposure: number;
  risk_level: string;
  summary: string;
  indicators: Indicator[];
  opened_link?: boolean | null;
  entered_credentials?: boolean | null;
  entered_otp?: boolean | null;
  is_emergency?: boolean | null;
  actions?: ActionItem[];
}
