from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any

class Indicator(BaseModel):
    title: str
    impact: str  # e.g., "KRITIS", "TINGGI", "SEDANG", "INFO", "AMAN"
    level: Literal["red", "orange", "green", "blue"]
    desc: str

class CategoryScore(BaseModel):
    name: str
    score: str

class AnalyzeRequest(BaseModel):
    type: Literal["url", "text", "screenshot", "voice"] = "url"
    content: str = Field(..., description="The URL, text message, or voice transcript to analyze")
    image_base64: Optional[str] = Field(None, description="Optional base64 image string for screenshot analysis")

class AnalyzeResponse(BaseModel):
    case_id: str
    timestamp: str
    content_risk: int = Field(..., ge=0, le=100)
    confidence: int = Field(..., ge=0, le=100)
    risk_level: str
    summary: str
    categories: List[CategoryScore]
    indicators: List[Indicator]
    initial_exposure: int = 10
    evidence_type: str
    source_model: str

class InterviewRequest(BaseModel):
    case_id: str
    content_risk: int = 80
    opened_link: Optional[bool] = None
    entered_credentials: Optional[bool] = None
    entered_otp: Optional[bool] = None

class ActionItem(BaseModel):
    step: int
    title: str
    desc: str
    is_urgent: bool = False

class InterviewResponse(BaseModel):
    case_id: str
    user_exposure: int
    exposure_level: str
    is_emergency: bool
    status_desc: str
    emergency_title: str
    emergency_subtitle: str
    actions: List[ActionItem]
    timeline_event: Optional[Dict[str, Any]] = None

class CaseReportRequest(BaseModel):
    case_id: str
    content_risk: int
    confidence: int
    user_exposure: int
    evidence_type: str
    evidence_content: str
    opened_link: Optional[bool] = None
    entered_credentials: Optional[bool] = None
    entered_otp: Optional[bool] = None
    indicators: List[Indicator] = []
