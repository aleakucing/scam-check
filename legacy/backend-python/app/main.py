import logging
from fastapi import FastAPI, HTTPException, Depends
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
from .services.rate_limiter import check_rate_limit
from .services.case_store import save_case, get_case, list_recent_cases

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

@app.get("/result")
def result_page():
    import os
    from fastapi.responses import FileResponse
    if os.path.exists("frontend/result.html"):
        return FileResponse("frontend/result.html")
    elif os.path.exists("result.html"):
        return FileResponse("result.html")
    return {"status": "result page"}

@app.get("/landingpage")
def landing_page():
    import os
    from fastapi.responses import FileResponse
    if os.path.exists("frontend/landingpage.html"):
        return FileResponse("frontend/landingpage.html")
    elif os.path.exists("landingpage.html"):
        return FileResponse("landingpage.html")
    return {"status": "landing page"}

@app.get("/api/health")
def health():
    has_gemini = bool(settings.GEMINI_API_KEY)
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "ai_engine": f"Gemini ({settings.GEMINI_MODEL})" if has_gemini else "Built-in Heuristic Safety Engine",
        "ai_key_configured": has_gemini,
        "ssrf_protection": "active",
        "pii_masking": "active",
        "rate_limiting": "active (60 req/min)",
        "case_vault": "persistent_sqlite"
    }

@app.get("/api/cases")
def list_cases_endpoint(limit: int = 15):
    """Retrieve recent case summaries from evidence vault (PRD Section 33 & 34)."""
    return list_recent_cases(limit=limit)

@app.get("/api/cases/{case_id}")
def get_case_endpoint(case_id: str):
    """Retrieve single case record by unique case ID."""
    case = get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Kasus tidak ditemukan dalam evidence vault.")
    return case

@app.post("/api/analyze", response_model=AnalyzeResponse, dependencies=[Depends(check_rate_limit)])
async def analyze_endpoint(req: AnalyzeRequest):
    if not req.content or len(req.content.strip()) == 0:
        raise HTTPException(status_code=400, detail="Konten bukti tidak boleh kosong.")
    
    # Payload sanity check (max 10MB base64)
    if req.image_base64 and len(req.image_base64) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Ukuran berkas gambar melebihi batas 10MB.")

    try:
        response = await analyze_with_ai(req)
    except Exception as e:
        logger.error(f"Error in /api/analyze: {str(e)}")
        # Fallback safeguard
        response = analyze_heuristic(req)

    # Persist in Evidence Vault (PRD Section 33)
    try:
        save_case({
            "case_id": response.case_id,
            "timestamp": response.timestamp,
            "evidence_type": response.evidence_type,
            "evidence_content": req.content,
            "content_risk": response.content_risk,
            "confidence": response.confidence,
            "user_exposure": response.initial_exposure,
            "risk_level": response.risk_level,
            "summary": response.summary,
            "indicators": [ind.dict() for ind in response.indicators]
        })
    except Exception as err:
        logger.error(f"Failed to auto-save case in vault: {err}")

    return response

@app.post("/api/interview", response_model=InterviewResponse)
def interview_endpoint(req: InterviewRequest):
    try:
        eval_resp = evaluate_exposure(req)
        # Update case in Evidence Vault
        save_case({
            "case_id": req.case_id,
            "user_exposure": eval_resp.user_exposure,
            "opened_link": req.opened_link,
            "entered_credentials": req.entered_credentials,
            "entered_otp": req.entered_otp,
            "is_emergency": eval_resp.is_emergency,
            "actions": [act.dict() for act in eval_resp.actions]
        })
        return eval_resp
    except Exception as e:
        logger.error(f"Error in /api/interview: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/report", dependencies=[Depends(check_rate_limit)])
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

@app.post("/api/webhook/telegram")
async def telegram_webhook(payload: dict):
    """Unified Telegram Bot Webhook (PRD Section 6.1)."""
    message = payload.get("message", {})
    text = message.get("text", "") or payload.get("text", "")
    chat_id = message.get("chat", {}).get("id") or payload.get("chat_id")

    if text.startswith("/check"):
        text = text.replace("/check", "", 1).strip()
    elif text.startswith("/start"):
        return {
            "status": "welcome",
            "chat_id": chat_id,
            "reply_text": "🛡️ *Selamat datang di ScamGuard AI Bot!*\n\nKirimkan tautan mencurigakan, pesan WhatsApp, atau ketik `/check <link>` untuk analisis instan."
        }

    if not text or not text.strip():
        return {"status": "ignored", "detail": "Pesan kosong atau tanpa teks."}

    evidence_type = "url" if text.strip().startswith("http") else "text"
    req = AnalyzeRequest(type=evidence_type, content=text)
    try:
        analysis = await analyze_with_ai(req)
    except Exception:
        analysis = analyze_heuristic(req)

    try:
        save_case({
            "case_id": analysis.case_id,
            "timestamp": analysis.timestamp,
            "evidence_type": analysis.evidence_type,
            "evidence_content": text,
            "content_risk": analysis.content_risk,
            "confidence": analysis.confidence,
            "user_exposure": analysis.initial_exposure,
            "risk_level": analysis.risk_level,
            "summary": analysis.summary,
            "indicators": [ind.dict() for ind in analysis.indicators]
        })
    except Exception as err:
        logger.error(f"Failed to auto-save telegram case: {err}")

    status_emoji = "🚨" if analysis.content_risk >= 75 else ("⚠️" if analysis.content_risk >= 50 else "✅")
    reply = (
        f"{status_emoji} *HASIL ANALISIS SCAMGUARD AI*\n"
        f"━━━━━━━━━━━━━━━━━━\n"
        f"📋 *ID Kasus*: `{analysis.case_id}`\n"
        f"⚠️ *Tingkat Risiko*: *{analysis.content_risk}/100* ({analysis.risk_level.upper()})\n"
        f"🎯 *Keyakinan AI*: {analysis.confidence}%\n\n"
        f"📝 *Ringkasan*: {analysis.summary}\n\n"
    )
    if analysis.indicators:
        reply += "*Temuan Indikator:*\n"
        for ind in analysis.indicators[:3]:
            reply += f"• [{ind.impact}] {ind.title}\n"

    if analysis.content_risk >= 75:
        reply += (
            f"\n🚨 *PANDUAN DARURAT:*\n"
            f"Jika sudah terlanjur membuka tautan / mengisi data:\n"
            f"• HaloBCA: 1500888\n"
            f"• BRI: 14017\n"
            f"• Mandiri: 14000\n"
        )

    return {
        "status": "success",
        "case_id": analysis.case_id,
        "chat_id": chat_id,
        "reply_text": reply
    }

@app.post("/api/webhook/whatsapp")
async def whatsapp_webhook(payload: dict):
    """Unified WhatsApp Bot Webhook (PRD Section 6.1)."""
    text = ""
    sender = ""
    if "entry" in payload and payload["entry"]:
        for entry in payload.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                messages = value.get("messages", [])
                if messages:
                    msg = messages[0]
                    sender = msg.get("from", "")
                    if msg.get("type") == "text":
                        text = msg.get("text", {}).get("body", "")
    if not text:
        text = payload.get("text", "") or payload.get("body", "")
        sender = payload.get("from", "") or payload.get("sender", "")

    if not text or not text.strip():
        return {"status": "ignored", "detail": "Pesan kosong."}

    evidence_type = "url" if text.strip().startswith("http") else "text"
    req = AnalyzeRequest(type=evidence_type, content=text)
    try:
        analysis = await analyze_with_ai(req)
    except Exception:
        analysis = analyze_heuristic(req)

    try:
        save_case({
            "case_id": analysis.case_id,
            "timestamp": analysis.timestamp,
            "evidence_type": analysis.evidence_type,
            "evidence_content": text,
            "content_risk": analysis.content_risk,
            "confidence": analysis.confidence,
            "user_exposure": analysis.initial_exposure,
            "risk_level": analysis.risk_level,
            "summary": analysis.summary,
            "indicators": [ind.dict() for ind in analysis.indicators]
        })
    except Exception as err:
        logger.error(f"Failed to auto-save whatsapp case: {err}")

    status_emoji = "🚨" if analysis.content_risk >= 75 else ("⚠️" if analysis.content_risk >= 50 else "✅")
    reply = (
        f"🛡️ *SCAMGUARD AI - HASIL DETEKSI*\n"
        f"ID Kasus: {analysis.case_id}\n\n"
        f"{status_emoji} *Tingkat Risiko: {analysis.content_risk}/100*\n"
        f"Keyakinan AI: {analysis.confidence}%\n\n"
        f"📋 *Penjelasan:*\n{analysis.summary}\n\n"
    )
    if analysis.content_risk >= 75:
        reply += (
            f"🚨 *TINDAKAN DARURAT (JIKA SUDAH KLIK/ISI DATA):*\n"
            f"Segera hubungi bank untuk blokir rekening:\n"
            f"1. HaloBCA: 1500888\n"
            f"2. BRI: 14017\n"
            f"3. Mandiri: 14000\n\n"
            f"Jangan berikan kode OTP kepada siapapun!"
        )
    else:
        reply += f"💡 Saran: Selalu cek keaslian domain resmi sebelum bertransaksi."

    return {
        "status": "success",
        "case_id": analysis.case_id,
        "recipient": sender,
        "reply_text": reply
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
