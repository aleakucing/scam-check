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
  type: EvidenceType;
  content: string;
  image_base64?: string | null;
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
}

export interface TimelineEvent {
  time: string;
  tag: string;
  color: string;
  text: string;
}

export interface CaseHistoryItem {
  case_id: string;
  content: string;
  risk: number;
  summary: string;
  timestamp: string;
  evidence_type?: string;
}
