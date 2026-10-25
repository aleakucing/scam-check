import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "./config";
import { rateLimiter, uploadRateLimiter } from "./services/rateLimiter";
import { maskSensitiveData } from "./services/privacy";
import { analyzeWithAi } from "./services/aiAgent";
import { synthesizeSpeechIndonesian } from "./services/geminiTts";
import { synthesizeSpeechGoogle } from "./services/googleTranslateTts";
import { analyzeHeuristic } from "./services/heuristicAnalyzer";
import { evaluateExposure } from "./services/exposureEvaluator";
import { saveCase, getCase, pingDb, getDriver } from "./db/activeStore";
import { accessGranted } from "./db/types";
import {
  AnalyzeRequest,
  AnalyzeResponse,
  InterviewRequest,
  CaseReportRequest
} from "./types";
import { validateEvidenceInput } from "./services/inputValidator";

const app = new Hono();

// Global resilience handlers
app.onError((err, c) => {
  console.error("[KrosCheck Server Error]:", err?.message || err);
  return c.json({ detail: "Terjadi gangguan pada layanan server.", error: String(err?.message || err) }, 500);
});

// CORS Middleware
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

// Helper to get client IP for rate limiting (spoofing-resistant)
function getClientIp(c: any): string {
  // Cloudflare / CDN in front of the app
  const cfIp = c.req.header("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  // Prefer X-Real-IP set by a trusted upstream reverse proxy (Nginx / Render)
  const realIp = c.req.header("x-real-ip");
  if (realIp) return realIp.trim();

  // With a single trusted proxy in front, the first entry is the real client.
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((s: string) => s.trim());
    return parts[0] || "127.0.0.1";
  }

  return "127.0.0.1";
}

// Magic bytes validator for uploaded base64 images (JPEG, PNG, WebP only)
function validateImagePayload(base64Str: string): { valid: boolean; mime?: string; error?: string } {
  const pureBase64 = base64Str.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "").trim();
  if (!pureBase64) {
    return { valid: false, error: "Data berkas gambar kosong." };
  }

  // Keep the analyzed base64 payload below Vercel's 4.5 MB request limit.
  if (pureBase64.length > 4 * 1024 * 1024) {
    return { valid: false, error: "Ukuran berkas gambar melebihi batas 4MB setelah kompresi." };
  }

  try {
    const buffer = Buffer.from(pureBase64.slice(0, 64), "base64");
    if (buffer.length < 4) {
      return { valid: false, error: "Format berkas gambar tidak valid atau data rusak." };
    }

    // JPEG magic bytes: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return { valid: true, mime: "image/jpeg" };
    }
    // PNG magic bytes: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return { valid: true, mime: "image/png" };
    }
    // WebP magic bytes: RIFF .... WEBP
    if (
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer.length >= 12 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
      return { valid: true, mime: "image/webp" };
    }

    return {
      valid: false,
      error: "Format gambar tidak didukung. Hanya gambar JPEG, PNG, dan WebP yang diizinkan. Berkas SVG, HTML, dan script executable dilarang demi keamanan siber."
    };
  } catch {
    return { valid: false, error: "Gagal memproses berkas gambar base64." };
  }
}

// Swagger/OpenAPI compatibility endpoints
app.get("/docs", (c) => c.redirect("/api/health"));
app.get("/openapi.json", (c) =>
  c.json({
    openapi: "3.0.0",
    info: {
      title: config.PROJECT_NAME,
      version: config.VERSION,
      description: "KrosCheck API Engine (Bun + Hono)"
    }
  })
);

// Health check endpoint (also keeps the free database awake when polled)
app.get("/api/health", async (c) => {
  const hasGemini = Boolean(config.GEMINI_API_KEY);

  let databaseOk = true;
  try {
    await pingDb();
  } catch (err: any) {
    databaseOk = false;
    console.error("[KrosCheck] Database health check failed:", err?.message || err);
  }

  return c.json({
    status: databaseOk ? "healthy" : "degraded",
    version: config.VERSION,
    ai_engine: hasGemini
      ? `Gemini (${config.GEMINI_MODEL})`
      : "Built-in Heuristic Safety Engine",
    ai_key_configured: hasGemini,
    ssrf_protection: "active",
    pii_masking: "active",
    rate_limiting: "active (60 req/min)",
    case_vault: databaseOk
      ? getDriver() === "postgres"
        ? "postgres"
        : "persistent_sqlite_bun"
      : "unavailable",
    database: getDriver(),
    database_ok: databaseOk
  });
});

// The case list is private. A case opens only with its unguessable access key.
app.get("/api/cases", (c) => {
  return c.json(
    { detail: "Daftar kasus tidak tersedia. Buka kasus lewat tautan pribadi yang berisi kode akses." },
    404
  );
});

app.get("/api/cases/:id", async (c) => {
  const caseId = c.req.param("id");
  const key = c.req.query("k") || "";
  const caseData = await getCase(caseId);
  if (!caseData || !accessGranted(caseData.access_token, key)) {
    return c.json({ detail: "Kasus tidak ditemukan atau kode akses tidak valid." }, 404);
  }
  caseData.evidence_content = maskSensitiveData(caseData.evidence_content || "");
  delete caseData.access_token;
  return c.json(caseData);
});

// Analyze digital evidence endpoint
app.post("/api/analyze", async (c) => {
  const clientIp = getClientIp(c);
  if (!rateLimiter.isAllowed(clientIp)) {
    return c.json(
      { detail: "Batas permintaan terlampaui (Rate limit 60 req/menit). Coba beberapa saat lagi." },
      429
    );
  }

  let body: AnalyzeRequest;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ detail: "Format permintaan JSON tidak valid." }, 400);
  }

  if (!body.content || body.content.trim().length === 0) {
    return c.json({ detail: "Konten bukti tidak boleh kosong." }, 400);
  }

  // Max content length check (50KB limit to prevent prompt flooding / resource exhaustion)
  if (body.content.length > 50000) {
    return c.json({ detail: "Panjang konten melebihi batas maksimal 50.000 karakter." }, 413);
  }

  // Anti-Gibberish & Input Validation
  const validation = validateEvidenceInput(body.content, body.type, Boolean(body.image_base64));
  if (!validation.valid) {
    return c.json({ detail: validation.error || "Konten bukti tidak valid." }, 400);
  }
  if (validation.normalizedType && !body.type) {
    body.type = validation.normalizedType;
  }

  // Image Upload Security: Dedicated Rate Limit (15 req/min) & Magic Bytes Validation
  if (body.image_base64) {
    if (!uploadRateLimiter.isAllowed(clientIp)) {
      return c.json(
        { detail: "Batas unggah gambar terlampaui (Maksimal 15 berkas per menit). Coba beberapa saat lagi." },
        429
      );
    }

    const imgCheck = validateImagePayload(body.image_base64);
    if (!imgCheck.valid) {
      return c.json({ detail: imgCheck.error }, 400);
    }
  }

  let response: AnalyzeResponse;
  try {
    response = await analyzeWithAi(body);
  } catch (err: any) {
    console.error("Error in AI analysis:", err.message);
    response = analyzeHeuristic(body);
  }

  // Persist to Evidence Vault with Server-Side PII Masking BEFORE the database write
  const safeContent = maskSensitiveData(body.content);
  try {
    const saved = await saveCase({
      case_id: response.case_id,
      timestamp: response.timestamp,
      evidence_type: response.evidence_type,
      evidence_content: safeContent,
      content_risk: response.content_risk,
      confidence: response.confidence,
      user_exposure: response.initial_exposure,
      risk_level: response.risk_level,
      summary: response.summary,
      indicators: response.indicators,
      categories: response.categories,
      source_model: response.source_model
    });
    response.access_key = saved.access_token;
  } catch (err: any) {
    console.error("Failed to auto-save case in vault:", err.message);
  }

  return c.json(response);
});

// Adaptive interview endpoint
app.post("/api/interview", async (c) => {
  let body: InterviewRequest;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ detail: "Format JSON tidak valid." }, 400);
  }

  if (!body.case_id) {
    return c.json({ detail: "case_id wajib diisi." }, 400);
  }

  try {
    const evalResp = evaluateExposure(body);
    const key = (body.access_key || "").trim();
    if (key) {
      const existing = await getCase(body.case_id);
      if (!existing || !accessGranted(existing.access_token, key)) {
        return c.json({ detail: "Kasus tidak ditemukan atau kode akses tidak valid." }, 404);
      }
      await saveCase({
        case_id: body.case_id,
        user_exposure: evalResp.user_exposure,
        opened_link: body.opened_link,
        entered_credentials: body.entered_credentials,
        entered_otp: body.entered_otp,
        is_emergency: evalResp.is_emergency,
        actions: evalResp.actions
      });
    }

    return c.json(evalResp);
  } catch (err: any) {
    console.error("Error in /api/interview:", err.message);
    return c.json({ detail: err.message }, 500);
  }
});

// Incident Report Generation
app.post("/api/report", async (c) => {
  const clientIp = getClientIp(c);
  if (!rateLimiter.isAllowed(clientIp)) {
    return c.json({ detail: "Batas permintaan terlampaui. Coba beberapa saat lagi." }, 429);
  }

  let body: CaseReportRequest;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ detail: "Format JSON tidak valid." }, 400);
  }

  const cleanEvidence = maskSensitiveData(body.evidence_content || "");

  const lines: string[] = [
    "==================================================================",
    "             KROSCHECK - LAPORAN INSIDEN RESMI                    ",
    "==================================================================",
    `ID KASUS       : ${body.case_id}`,
    `TIPE BUKTI     : ${(body.evidence_type || "UNKNOWN").toUpperCase()}`,
    `KONTEN BUKTI   : ${cleanEvidence}`,
    "------------------------------------------------------------------",
    "PENILAIAN TIGA DIMENSI RISIKO:",
    `1. Content Risk     : ${body.content_risk}%`,
    `2. Confidence Score : ${body.confidence}%`,
    `3. User Exposure    : ${body.user_exposure}%`,
    "------------------------------------------------------------------",
    "INTERVIEW & STATUS TINDAKAN PENGGUNA:",
    `- Membuka Tautan      : ${body.opened_link ? "YA" : body.opened_link === false ? "TIDAK" : "Belum dijawab"}`,
    `- Menginput Password  : ${body.entered_credentials ? "YA (KREDENSIAL DISERAHKAN)" : body.entered_credentials === false ? "TIDAK" : "Belum dijawab"}`,
    `- Menginput Kode OTP  : ${body.entered_otp ? "YA (KRITIS)" : body.entered_otp === false ? "TIDAK" : "Belum dijawab"}`,
    "------------------------------------------------------------------",
    "INDIKATOR RISIKO YANG DITEMUKAN:"
  ];

  if (body.indicators && body.indicators.length > 0) {
    body.indicators.forEach((ind, idx) => {
      const cleanDesc = maskSensitiveData(ind.desc || "");
      lines.push(`${idx + 1}. [${ind.impact}] ${ind.title}: ${cleanDesc}`);
    });
  } else {
    lines.push("(Tidak ada indikator teknis terlampir)");
  }

  lines.push(
    "------------------------------------------------------------------",
    "DISCLAIMER:",
    "Laporan ini merupakan hasil analisis indikator risiko digital dan bukan",
    "merupakan keputusan hukum mutlak. Simpan dokumen ini sebagai referensi",
    "pelaporan ke pihak berwajib atau institusi perbankan terkait.",
    "=================================================================="
  );

  return c.json({
    case_id: body.case_id,
    formatted_text: lines.join("\n"),
    masked_evidence: cleanEvidence
  });
});

// Text-to-Speech (Gemini AI voice, Bahasa Indonesia)
// API key tidak pernah diekspos ke browser — frontend memanggil endpoint ini,
// dan otomatis fallback ke speechSynthesis bawaan jika layanan gagal.
app.post("/api/tts", async (c) => {
  const clientIp = getClientIp(c);
  if (!rateLimiter.isAllowed(clientIp)) {
    return c.json(
      { detail: "Batas permintaan terlampaui (Rate limit 60 req/menit). Coba beberapa saat lagi." },
      429
    );
  }

  let body: { text?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ detail: "Format JSON tidak valid." }, 400);
  }

  const text = (body.text || "").trim();
  if (!text) {
    return c.json({ detail: "Teks tidak boleh kosong." }, 400);
  }

  // Serverless platforms cap the response body at 4.5 MB. A Gemini WAV for
  // 2,000 characters can exceed that, so on Vercel we use the much smaller
  // Google TTS MP3 and a shorter text budget. The Bun/VPS path keeps Gemini.
  const isVercel = Boolean(process.env.VERCEL);
  const maxTtsChars = isVercel ? 600 : 2000;
  if (text.length > maxTtsChars) {
    return c.json(
      { detail: `Panjang teks melebihi batas maksimal ${maxTtsChars} karakter.` },
      413
    );
  }

  // Jangan kirim PII mentah ke pihak ketiga — samarkan dulu.
  const safeText = maskSensitiveData(text);

  // Lapis 1 (Bun/VPS): Gemini AI. Di Vercel, Gemini WAV terlalu besar dan
  // terlalu lama; langsung pakai Google TTS MP3. Lapis terakhir (frontend):
  // suara browser bila layanan server gagal.
  if (!isVercel) {
    const gemini = await synthesizeSpeechIndonesian(safeText);
    if (gemini.ok) {
      return c.json({ audio_base64: gemini.audio.audioBase64, mime_type: gemini.audio.mimeType });
    }
    if (gemini.reason !== "quota") {
      console.warn("Gemini TTS gagal, beralih ke Google TTS.");
    }
  }

  const google = await synthesizeSpeechGoogle(safeText);
  if (google) {
    return c.json({ audio_base64: google.audioBase64, mime_type: google.mimeType });
  }

  return c.json({ detail: "Gagal menghasilkan suara AI. Coba beberapa saat lagi." }, 502);
});

// Bot channels are not live. Reject every webhook instead of accepting unsigned payloads.
app.post("/api/webhook/telegram", (c) => {
  return c.json({
    status: "coming_soon",
    detail: "Bot Telegram KrosCheck belum tersedia."
  }, 503);
});

app.post("/api/webhook/whatsapp", (c) => {
  return c.json({
    status: "coming_soon",
    detail: "Bot WhatsApp KrosCheck belum tersedia."
  }, 503);
});

export { app };
