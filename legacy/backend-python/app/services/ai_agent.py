import json
import logging
from datetime import datetime
import httpx
from ..config import settings
from ..models.schemas import AnalyzeRequest, AnalyzeResponse, Indicator, CategoryScore
from .heuristic_analyzer import analyze_heuristic
from .privacy import mask_sensitive_data

logger = logging.getLogger("scamguard.ai")

SYSTEM_PROMPT = """Anda adalah ScamGuard AI Agent, sistem analisis risiko keamanan digital dan penipuan online (Cyber Security & Anti Scam).
Tugas Anda adalah menilai indikator risiko dari bukti digital (URL, teks pesan SMS/WA/Email, transkrip suara, atau gambar).

PERATURAN PENTING:
1. JANGAN memberikan vonis absolut ("Ini 100% penipuan" atau "Pasti phishing").
2. Gunakan prinsip penilaian risiko: "Risk Score 0-100%", "Tingkat Risiko", dan "Indikator Bukti".
3. Berikan output HANYA dalam format JSON valid tanpa format markdown ```json ... ```.

Format JSON yang diwajibkan:
{
  "content_risk": <integer 0-100>,
  "confidence": <integer 0-100>,
  "risk_level": "<VERY HIGH RISK | HIGH RISK | MEDIUM RISK | LOW RISK / SAFE>",
  "summary": "<Ringkasan singkat maksimal 2 kalimat mengenai temuan risiko dalam Bahasa Indonesia>",
  "categories": [
    {"name": "<Nama Kategori Risiko, misal: Phishing Perbankan / Malware APK / Undian Palsu>", "score": "<persentase, misal: 92%>"}
  ],
  "indicators": [
    {
      "title": "<Judul Indikator Singkat>",
      "impact": "<KRITIS | TINGGI | SEDANG | AMAN>",
      "level": "<red | orange | green | blue>",
      "desc": "<Penjelasan teknis mengapa hal ini berbahaya atau aman dalam Bahasa Indonesia>"
    }
  ]
}
"""

async def analyze_with_ai(req: AnalyzeRequest) -> AnalyzeResponse:
    # If no API key configured, use intelligent heuristic engine
    if not settings.GEMINI_API_KEY and not settings.OPENAI_API_KEY:
        return analyze_heuristic(req)

    # Try Gemini API if key is present
    if settings.GEMINI_API_KEY:
        try:
            model_name = settings.GEMINI_MODEL
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
            
            # Construct Multimodal Parts
            parts = [{"text": SYSTEM_PROMPT}]

            if req.type == "screenshot" and req.image_base64:
                # Multimodal Image Processing via inline_data
                parts.append({
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": req.image_base64
                    }
                })
                parts.append({
                    "text": f"Tipe Bukti: {req.type}\nDeskripsi tambahan: {req.content}\nAnalisis visual tangkapan layar di atas untuk mendeteksi manipulasi desain, logo tiruan, nomor tidak resmi, atau teks penipuan."
                })
            else:
                parts.append({
                    "text": f"Tipe Bukti: {req.type}\nKonten yang dianalisis:\n{req.content}"
                })

            payload = {
                "contents": [
                    {
                        "parts": parts
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "responseMimeType": "application/json"
                }
            }

            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidate = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(candidate)

                    case_id = f"SC-{datetime.now().strftime('%Y%m%d')}-{abs(hash(req.content)) % 9000 + 1000}"
                    summary_text = mask_sensitive_data(parsed.get("summary", "Analisis AI selesai."))

                    return AnalyzeResponse(
                        case_id=case_id,
                        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S WIB"),
                        content_risk=int(parsed.get("content_risk", 75)),
                        confidence=int(parsed.get("confidence", 85)),
                        risk_level=parsed.get("risk_level", "HIGH RISK"),
                        summary=summary_text,
                        categories=[CategoryScore(**c) for c in parsed.get("categories", [])],
                        indicators=[Indicator(**i) for i in parsed.get("indicators", [])],
                        initial_exposure=10,
                        evidence_type=req.type,
                        source_model=f"Google Gemini ({model_name})"
                    )
                else:
                    logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text}")
        except Exception as e:
            logger.error(f"Error querying Gemini API: {str(e)}")

    # Graceful fallback to heuristic analyzer
    return analyze_heuristic(req)
