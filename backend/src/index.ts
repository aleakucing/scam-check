import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "./config";
import { rateLimiter, uploadRateLimiter } from "./services/rateLimiter";
import { maskSensitiveData } from "./services/privacy";
import { analyzeWithAi } from "./services/aiAgent";
import { analyzeHeuristic } from "./services/heuristicAnalyzer";
import { evaluateExposure } from "./services/exposureEvaluator";
import { saveCase, getCase, listRecentCases } from "./db/caseStore";
import {
  AnalyzeRequest,
  AnalyzeResponse,
  InterviewRequest,
  CaseReportRequest
} from "./types";
import { validateEvidenceInput } from "./services/inputValidator";

import { serveStatic } from "hono/bun";
import { existsSync } from "fs";
import { resolve } from "path";

const app = new Hono();

// Global resilience handlers
app.onError((err, c) => {
  console.error("[ScamGuard Server Error]:", err?.message || err);
  return c.json({ detail: "Terjadi gangguan pada layanan server.", error: String(err?.message || err) }, 500);
});

process.on("unhandledRejection", (reason) => {
  console.warn("[ScamGuard Warning] Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[ScamGuard Critical] Uncaught Exception caught:", err);
});

const candidates = [
  resolve(import.meta.dir, "../../frontend/dist"),
  resolve(import.meta.dir, "../frontend/dist"),
  resolve(process.cwd(), "../frontend/dist"),
  resolve(process.cwd(), "./dist"),
  "/usr/share/nginx/html"
];
const distPath = candidates.find(p => existsSync(p)) || resolve(import.meta.dir, "../../frontend/dist");
const distIndexHtml = resolve(distPath, "index.html");

// CORS Middleware
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

// Serve static assets from frontend dist if available
if (existsSync(distPath)) {
  app.use("/assets/*", serveStatic({ root: distPath }));
}

// Helper to get client IP for rate limiting (spoofing-resistant)
function getClientIp(c: any): string {
  // Prefer X-Real-IP set by trusted upstream reverse proxy (Nginx)
  const realIp = c.req.header("x-real-ip");
  if (realIp) return realIp.trim();

  // If X-Forwarded-For is provided, take the last IP (closest to trusted proxy)
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((s: string) => s.trim());
    return parts[parts.length - 1] || parts[0];
  }

  return "127.0.0.1";
}

// Magic bytes validator for uploaded base64 images (JPEG, PNG, WebP only)
function validateImagePayload(base64Str: string): { valid: boolean; mime?: string; error?: string } {
  const pureBase64 = base64Str.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "").trim();
  if (!pureBase64) {
    return { valid: false, error: "Data berkas gambar kosong." };
  }

  if (pureBase64.length > 10 * 1024 * 1024) {
    return { valid: false, error: "Ukuran berkas gambar melebihi batas 10MB." };
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

// Root Status / SPA entry
app.get("/", async (c) => {
  if (c.req.header("accept")?.includes("text/html") && existsSync(distIndexHtml)) {
    return c.html(await Bun.file(distIndexHtml).text());
  }
  return c.json({
    status: "online",
    service: config.PROJECT_NAME,
    version: config.VERSION,
    runtime: `Bun ${Bun.version}`,
    docs_url: "/api/health"
  });
});

const spaRoutes = [
  "/result",
  "/how-it-works",
  "/faq",
  "/download",
  "/trends",
  "/about",
  "/privacy",
  "/terms"
];

for (const route of spaRoutes) {
  app.get(route, async (c) => {
    if (existsSync(distIndexHtml)) {
      return c.html(await Bun.file(distIndexHtml).text());
    }
    return c.json({ status: `${route} page` });
  });
}

// Swagger/OpenAPI compatibility endpoints
app.get("/docs", (c) => c.redirect("/api/health"));
app.get("/openapi.json", (c) =>
  c.json({
    openapi: "3.0.0",
    info: {
      title: config.PROJECT_NAME,
      version: config.VERSION,
      description: "ScamGuard AI & KrosCheck PRO API Engine (Bun + Hono)"
    }
  })
);

// Health check endpoint
app.get("/api/health", (c) => {
  const hasGemini = Boolean(config.GEMINI_API_KEY);
  return c.json({
    status: "healthy",
    version: config.VERSION,
    ai_engine: hasGemini
      ? `Gemini (${config.GEMINI_MODEL})`
      : "Built-in Heuristic Safety Engine",
    ai_key_configured: hasGemini,
    ssrf_protection: "active",
    pii_masking: "active",
    rate_limiting: "active (60 req/min)",
    case_vault: "persistent_sqlite_bun"
  });
});

// List recent cases from vault
app.get("/api/cases", (c) => {
  const limitQuery = c.req.query("limit");
  const limit = limitQuery ? Math.min(100, Math.max(1, parseInt(limitQuery, 10))) : 15;
  const cases = listRecentCases(limit);
  return c.json(cases);
});

// Get specific case by ID
app.get("/api/cases/:id", (c) => {
  const caseId = c.req.param("id");
  const caseData = getCase(caseId);
  if (!caseData) {
    return c.json({ detail: "Kasus tidak ditemukan dalam evidence vault." }, 404);
  }
  // Defense-in-depth: Ensure evidence_content is masked when retrieved
  caseData.evidence_content = maskSensitiveData(caseData.evidence_content || "");
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

  // Persist to Evidence Vault with Server-Side PII Masking BEFORE SQLite write
  const safeContent = maskSensitiveData(body.content);
  try {
    saveCase({
      case_id: response.case_id,
      timestamp: response.timestamp,
      evidence_type: response.evidence_type,
      evidence_content: safeContent,
      content_risk: response.content_risk,
      confidence: response.confidence,
      user_exposure: response.initial_exposure,
      risk_level: response.risk_level,
      summary: response.summary,
      indicators: response.indicators
    });
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

    // Update case record in Vault
    saveCase({
      case_id: body.case_id,
      user_exposure: evalResp.user_exposure,
      opened_link: body.opened_link,
      entered_credentials: body.entered_credentials,
      entered_otp: body.entered_otp,
      is_emergency: evalResp.is_emergency,
      actions: evalResp.actions
    });

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
    "             SCAMGUARD AI - LAPORAN INSIDEN RESMI                 ",
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

// Telegram Webhook
app.post("/api/webhook/telegram", async (c) => {
  let payload: any = {};
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ status: "error", detail: "Invalid JSON" }, 400);
  }

  const message = payload.message || {};
  let text = (message.text || payload.text || "").trim();
  const chatId = message.chat?.id || payload.chat_id;

  if (text.startsWith("/check")) {
    text = text.replace("/check", "").trim();
  } else if (text.startsWith("/start")) {
    return c.json({
      status: "welcome",
      chat_id: chatId,
      reply_text:
        "🛡️ *Selamat datang di ScamGuard AI Bot!*\n\nKirimkan tautan mencurigakan, pesan WhatsApp, atau ketik `/check <link>` untuk analisis instan."
    });
  }

  if (!text) {
    return c.json({ status: "ignored", detail: "Pesan kosong atau tanpa teks." });
  }

  const evidenceType = text.startsWith("http") ? "url" : "text";
  const reqData: AnalyzeRequest = { type: evidenceType, content: text };

  let analysis: AnalyzeResponse;
  try {
    analysis = await analyzeWithAi(reqData);
  } catch {
    analysis = analyzeHeuristic(reqData);
  }

  try {
    saveCase({
      case_id: analysis.case_id,
      timestamp: analysis.timestamp,
      evidence_type: analysis.evidence_type,
      evidence_content: maskSensitiveData(text),
      content_risk: analysis.content_risk,
      confidence: analysis.confidence,
      user_exposure: analysis.initial_exposure,
      risk_level: analysis.risk_level,
      summary: analysis.summary,
      indicators: analysis.indicators
    });
  } catch (err: any) {
    console.error("Failed to auto-save telegram case:", err.message);
  }

  const statusEmoji =
    analysis.content_risk >= 75 ? "🚨" : analysis.content_risk >= 50 ? "⚠️" : "✅";
  let reply =
    `${statusEmoji} *HASIL ANALISIS SCAMGUARD AI*\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📋 *ID Kasus*: \`${analysis.case_id}\`\n` +
    `⚠️ *Tingkat Risiko*: *${analysis.content_risk}/100* (${analysis.risk_level.toUpperCase()})\n` +
    `🎯 *Keyakinan AI*: ${analysis.confidence}%\n\n` +
    `📝 *Ringkasan*: ${analysis.summary}\n\n`;

  if (analysis.indicators && analysis.indicators.length > 0) {
    reply += "*Temuan Indikator:*\n";
    analysis.indicators.slice(0, 3).forEach((ind) => {
      reply += `• [${ind.impact}] ${ind.title}\n`;
    });
  }

  if (analysis.content_risk >= 75) {
    reply +=
      `\n🚨 *PANDUAN DARURAT:*\n` +
      `Jika sudah terlanjur membuka tautan / mengisi data:\n` +
      `• HaloBCA: 1500888\n` +
      `• BRI: 14017\n` +
      `• Mandiri: 14000\n`;
  }

  return c.json({
    status: "success",
    case_id: analysis.case_id,
    chat_id: chatId,
    reply_text: reply
  });
});

// WhatsApp Webhook
app.post("/api/webhook/whatsapp", async (c) => {
  let payload: any = {};
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ status: "error", detail: "Invalid JSON" }, 400);
  }

  let text = "";
  let sender = "";

  if (payload.entry && Array.isArray(payload.entry)) {
    for (const entry of payload.entry) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        const messages = value.messages || [];
        if (messages.length > 0) {
          const msg = messages[0];
          sender = msg.from || "";
          if (msg.type === "text") {
            text = msg.text?.body || "";
          }
        }
      }
    }
  }

  if (!text) {
    text = payload.text || payload.body || "";
    sender = payload.from || payload.sender || "";
  }

  if (!text || !text.trim()) {
    return c.json({ status: "ignored", detail: "Pesan kosong." });
  }

  const evidenceType = text.trim().startsWith("http") ? "url" : "text";
  const reqData: AnalyzeRequest = { type: evidenceType, content: text.trim() };

  let analysis: AnalyzeResponse;
  try {
    analysis = await analyzeWithAi(reqData);
  } catch {
    analysis = analyzeHeuristic(reqData);
  }

  try {
    saveCase({
      case_id: analysis.case_id,
      timestamp: analysis.timestamp,
      evidence_type: analysis.evidence_type,
      evidence_content: text,
      content_risk: analysis.content_risk,
      confidence: analysis.confidence,
      user_exposure: analysis.initial_exposure,
      risk_level: analysis.risk_level,
      summary: analysis.summary,
      indicators: analysis.indicators
    });
  } catch (err: any) {
    console.error("Failed to auto-save whatsapp case:", err.message);
  }

  const statusEmoji =
    analysis.content_risk >= 75 ? "🚨" : analysis.content_risk >= 50 ? "⚠️" : "✅";
  let reply =
    `🛡️ *SCAMGUARD AI - HASIL DETEKSI*\n` +
    `ID Kasus: ${analysis.case_id}\n\n` +
    `${statusEmoji} *Tingkat Risiko: ${analysis.content_risk}/100*\n` +
    `Keyakinan AI: ${analysis.confidence}%\n\n` +
    `📋 *Penjelasan:*\n${analysis.summary}\n\n`;

  if (analysis.content_risk >= 75) {
    reply +=
      `🚨 *TINDAKAN DARURAT (JIKA SUDAH KLIK/ISI DATA):*\n` +
      `Segera hubungi bank untuk blokir rekening:\n` +
      `1. HaloBCA: 1500888\n` +
      `2. BRI: 14017\n` +
      `3. Mandiri: 14000\n\n` +
      `Jangan berikan kode OTP kepada siapapun!`;
  } else {
    reply += `💡 Saran: Selalu cek keaslian domain resmi sebelum bertransaksi.`;
  }

  return c.json({
    status: "success",
    case_id: analysis.case_id,
    recipient: sender,
    reply_text: reply
  });
});

console.log(`[ScamGuard Bun] Server running at http://${config.HOST}:${config.PORT}`);

export default {
  port: config.PORT,
  hostname: config.HOST,
  fetch: app.fetch
};

export { app };
