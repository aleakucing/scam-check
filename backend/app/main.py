import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .models.schemas import (
    AnalyzeRequest, AnalyzeResponse,
    InterviewRequest, InterviewResponse,
    CaseReportRequest
)
from .services.ai_agent import analyze_with_ai
from .services.exposure_evaluator import evaluate_exposure
from .services.heuristic_analyzer import analyze_heuristic
from .services.privacy import mask_sensitive_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scamguard.api")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API untuk ScamGuard AI - Risk Assessment & Anti-Scam Response Platform"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health():
    has_gemini = bool(settings.GEMINI_API_KEY)
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "ai_engine": f"Gemini ({settings.GEMINI_MODEL})" if has_gemini else "Built-in Heuristic Safety Engine",
        "ai_key_configured": has_gemini,
        "ssrf_protection": "active",
        "pii_masking": "active"
    }

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_endpoint(req: AnalyzeRequest):
    if not req.content or len(req.content.strip()) == 0:
        raise HTTPException(status_code=400, detail="Konten bukti tidak boleh kosong.")
    
    # Payload sanity check (max 10MB base64)
    if req.image_base64 and len(req.image_base64) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Ukuran berkas gambar melebihi batas 10MB.")

    try:
        response = await analyze_with_ai(req)
        return response
    except Exception as e:
        logger.error(f"Error in /api/analyze: {str(e)}")
        # Fallback safeguard
        return analyze_heuristic(req)

@app.post("/api/interview", response_model=InterviewResponse)
def interview_endpoint(req: InterviewRequest):
    try:
        return evaluate_exposure(req)
    except Exception as e:
        logger.error(f"Error in /api/interview: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/report")
def generate_report(req: CaseReportRequest):
    # Apply Sensitive Data Masking to protect victim privacy (PRD Section 41)
    clean_evidence = mask_sensitive_data(req.evidence_content)

    # Formatted Case Report document text
    lines = [
        "==================================================================",
        "             SCAMGUARD AI - LAPORAN INSIDEN RESMI                 ",
        "==================================================================",
        f"ID KASUS       : {req.case_id}",
        f"TIPE BUKTI     : {req.evidence_type.upper()}",
        f"KONTEN BUKTI   : {clean_evidence}",
        "------------------------------------------------------------------",
        "PENILAIAN TIGA DIMENSI RISIKO:",
        f"1. Content Risk     : {req.content_risk}%",
        f"2. Confidence Score : {req.confidence}%",
        f"3. User Exposure    : {req.user_exposure}%",
        "------------------------------------------------------------------",
        "INTERVIEW & STATUS TINDAKAN PENGGUNA:",
        f"- Membuka Tautan      : {'YA' if req.opened_link else ('TIDAK' if req.opened_link is False else 'Belum dijawab')}",
        f"- Menginput Password  : {'YA (KREDENSIAL DISERAHKAN)' if req.entered_credentials else ('TIDAK' if req.entered_credentials is False else 'Belum dijawab')}",
        f"- Menginput Kode OTP  : {'YA (KRITIS)' if req.entered_otp else ('TIDAK' if req.entered_otp is False else 'Belum dijawab')}",
        "------------------------------------------------------------------",
        "INDIKATOR RISIKO YANG DITEMUKAN:"
    ]
    for idx, ind in enumerate(req.indicators, start=1):
        clean_desc = mask_sensitive_data(ind.desc)
        lines.append(f"{idx}. [{ind.impact}] {ind.title}: {clean_desc}")

    lines.extend([
        "------------------------------------------------------------------",
        "DISCLAIMER:",
        "Laporan ini merupakan hasil analisis indikator risiko digital dan bukan",
        "merupakan keputusan hukum mutlak. Simpan dokumen ini sebagai referensi",
        "pelaporan ke pihak berwajib atau institusi perbankan terkait.",
        "=================================================================="
    ])

    return {
        "case_id": req.case_id,
        "formatted_text": "\n".join(lines),
        "masked_evidence": clean_evidence
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
