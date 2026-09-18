import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "./config";
import { rateLimiter } from "./services/rateLimiter";
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

import { serveStatic } from "hono/bun";
import { existsSync } from "fs";
import { resolve } from "path";

const app = new Hono();

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

// Helper to get client IP for rate limiting
function getClientIp(c: any): string {
  return (
    c.req.header("x-forwarded-for")?.split(",")[0].trim() ||
    c.req.header("x-real-ip") ||
    "127.0.0.1"
  );
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

  // Size limit check (10MB base64)
  if (body.image_base64 && body.image_base64.length > 10 * 1024 * 1024) {
    return c.json({ detail: "Ukuran berkas gambar melebihi batas 10MB." }, 413);
  }

  let response: AnalyzeResponse;
  try {
    response = await analyzeWithAi(body);
  } catch (err: any) {
    console.error("Error in AI analysis:", err.message);
    response = analyzeHeuristic(body);
  }

  // Persist to Evidence Vault
  try {
    saveCase({
      case_id: response.case_id,
      timestamp: response.timestamp,
      evidence_type: response.evidence_type,
      evidence_content: body.content,
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
      evidence_content: text,
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
