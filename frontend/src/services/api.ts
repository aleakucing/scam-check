import type {
  AnalyzeRequest,
  AnalyzeResponse,
  InterviewResponse,
  Indicator,
  CategoryScore
} from "../types";

// Determine API base URL dynamically
export function getApiBaseUrl(): string {
  if (typeof window === "undefined") return "http://localhost:8000";
  // If running on Vite dev server (e.g. port 5173 or 3000), backend is likely on 8000
  if (window.location.port === "5173" || window.location.port === "3000") {
    return "http://localhost:8000";
  }
  return window.location.origin;
}

export function maskSensitiveData(text: string): string {
  if (!text) return text;
  let masked = text;
  // Mask OTP
  masked = masked.replace(
    /\b(otp\s*[:=]?\s*|pin\s*[:=]?\s*|kode\s*verifikasi\s*[:=]?\s*)(\d{4,6})\b/gi,
    (_match, prefix, digits) => `${prefix}${"*".repeat(digits.length)}`
  );
  // Mask Card numbers
  masked = masked.replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, (match) => {
    const digits = match.replace(/\D/g, "");
    if (digits.length === 16) {
      const sep = match.includes(" ") ? " " : match.includes("-") ? "-" : "";
      return `${digits.slice(0, 4)}${sep}****${sep}****${sep}${digits.slice(-4)}`;
    }
    return match;
  });
  // Mask Phone numbers
  masked = masked.replace(/(?:\+62|62|08)(?:[0-9][ -]?){7,11}[0-9]\b/g, (match) => {
    const clean = match.replace(/[ -]/g, "");
    if (clean.length >= 10) {
      const prefixLen = clean.startsWith("+62") ? 4 : clean.startsWith("62") ? 3 : 4;
      const suffixLen = 2;
      const starsCount = Math.max(4, clean.length - prefixLen - suffixLen);
      return `${clean.slice(0, prefixLen)}${"*".repeat(starsCount)}${clean.slice(-suffixLen)}`;
    }
    return match;
  });
  return masked;
}

export async function checkApiHealth(): Promise<boolean> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function analyzeEvidence(req: AnalyzeRequest): Promise<AnalyzeResponse> {
  const base = getApiBaseUrl();
  const endpoints = [`${base}/api/analyze`, `http://localhost:8000/api/analyze`];

  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return (await res.json()) as AnalyzeResponse;
      }

      // If server rejected with 400 Bad Request / 413 / 429, don't fallback to dummy heuristic!
      if (res.status === 400 || res.status === 413 || res.status === 429) {
        const errData = await res.json().catch(() => ({ detail: "Permintaan tidak valid." }));
        const validationError = new Error(errData.detail || "Permintaan tidak valid.");
        (validationError as any).isValidationError = true;
        throw validationError;
      }
    } catch (e: any) {
      if (e.isValidationError) {
        throw e;
      }
      // network error / timeout: continue loop to next endpoint
    }
  }

  // Client-side fallback ONLY if backend is completely offline/unreachable
  return fallbackClientHeuristic(req);
}

export async function submitInterview(params: {
  case_id: string;
  content_risk?: number;
  opened_link?: boolean | null;
  entered_credentials?: boolean | null;
  entered_otp?: boolean | null;
}): Promise<InterviewResponse> {
  const base = getApiBaseUrl();
  const endpoints = [`${base}/api/interview`, `http://localhost:8000/api/interview`];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        return (await res.json()) as InterviewResponse;
      }
    } catch {
      // continue to fallback
    }
  }

  // Fallback exposure calculation
  let exposure = 10;
  let isEmergency = false;
  let exposureLevel = "PAPARAN MINIMAL";
  let statusDesc = "Anda baru menerima pesan dan belum berinteraksi lanjut.";

  if (params.opened_link === true) {
    exposure = 35;
    exposureLevel = "MEDIUM EXPOSURE";
    statusDesc = "Tautan sempat dibuka, namun belum ada kredensial atau formulir yang diisi.";
    if (params.entered_credentials === true) {
      exposure = 70;
      exposureLevel = "HIGH EXPOSURE";
      isEmergency = true;
      statusDesc = "Password atau kredensial akun telah dimasukkan pada formulir tidak resmi!";
      if (params.entered_otp === true) {
        exposure = 90;
        exposureLevel = "CRITICAL EXPOSURE";
        statusDesc = "Kredensial dan kode OTP/SMS telah diserahkan! Akun terancam dibobol.";
      }
    }
  }

  return {
    case_id: params.case_id,
    user_exposure: exposure,
    exposure_level: exposureLevel,
    is_emergency: isEmergency,
    status_desc: statusDesc,
    emergency_title: isEmergency ? "Tindakan Penyelamatan Darurat" : "Langkah Pencegahan (Normal)",
    emergency_subtitle: isEmergency
      ? "Data otentikasi telah diberikan pada tautan mencurigakan. Amankan akun sekarang:"
      : "Tingkat paparan akun masih rendah. Amankan perangkat Anda:",
    actions: [
      {
        step: 1,
        title: isEmergency
          ? "Tolak seluruh konfirmasi OTP yang masuk ke perangkat Anda"
          : "Jangan membuka atau menyebarkan tautan tersebut",
        desc: isEmergency
          ? "Pelaku sedang mencoba mengautentikasi sesi baru. Jangan setujui notifikasi transaksi apapun."
          : "Hapus atau tandai percakapan sebagai spam.",
        is_urgent: isEmergency
      },
      {
        step: 2,
        title: isEmergency
          ? "Kunci sementara rekening atau kartu debit/kredit"
          : "Konfirmasi informasi melalui kanal resmi institusi",
        desc: isEmergency
          ? "Gunakan menu Pengaturan Kartu pada mobile banking resmi untuk blokir transaksi."
          : "Kunjungi website resmi institusi untuk verifikasi kebenaran program.",
        is_urgent: isEmergency
      }
    ]
  };
}

export async function generateIncidentReport(params: any): Promise<{
  case_id: string;
  formatted_text: string;
  masked_evidence: string;
}> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/api/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  const masked = maskSensitiveData(params.evidence_content || "");
  const lines = [
    "==================================================================",
    "             KROSCHECK PRO - LAPORAN INSIDEN RESMI                 ",
    "==================================================================",
    `ID KASUS       : ${params.case_id}`,
    `TIPE BUKTI     : ${(params.evidence_type || "UNKNOWN").toUpperCase()}`,
    `KONTEN BUKTI   : ${masked}`,
    "------------------------------------------------------------------",
    "PENILAIAN TIGA DIMENSI RISIKO:",
    `1. Content Risk     : ${params.content_risk}%`,
    `2. Confidence Score : ${params.confidence}%`,
    `3. User Exposure    : ${params.user_exposure}%`,
    "=================================================================="
  ];
  return {
    case_id: params.case_id,
    formatted_text: lines.join("\n"),
    masked_evidence: masked
  };
}

function fallbackClientHeuristic(req: AnalyzeRequest): AnalyzeResponse {
  const content = req.content.toLowerCase();
  const caseId = `SC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 9000) + 1000}`;
  const isBcaLegit = content.includes("bca.co.id") || content.includes("klikbca.com");
  const isIdwebhost = content.includes("idwebhost.com");

  if (isBcaLegit || isIdwebhost) {
    return {
      case_id: caseId,
      timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
      content_risk: 12,
      confidence: 95,
      risk_level: "LOW RISK / SAFE",
      summary: "Domain teridentifikasi sebagai domain resmi institusi terdaftar. Tidak ditemukan manipulasi.",
      categories: [
        { name: "Komunikasi Resmi", score: "96%" },
        { name: "Layanan Terverifikasi", score: "92%" }
      ],
      indicators: [
        {
          title: "Domain Resmi Terverifikasi",
          impact: "AMAN",
          level: "green",
          desc: "Alamat host cocok dengan basis data institusi terpercaya."
        }
      ],
      initial_exposure: 10,
      evidence_type: req.type,
      source_model: "ScamGuard Client Heuristic Engine"
    };
  }

  const hasApk = content.includes(".apk");
  const hasBank = ["bca", "bri", "mandiri", "bni"].some((b) => content.includes(b));
  const indicators: Indicator[] = [];

  if (hasApk) {
    indicators.push({
      title: "Tautan Langsung Berkas Berbahaya (.APK Malware)",
      impact: "KRITIS",
      level: "red",
      desc: "Tautan mengarah ke pengunduhan file aplikasi Android (.APK) di luar Google Play Store."
    });
  }

  if (hasBank) {
    indicators.push({
      title: "Pencatutan Nama Bank / Layanan Finansial",
      impact: "KRITIS",
      level: "red",
      desc: "Mengatasnamakan institusi finansial dengan narasi pemblokiran atau kenaikan biaya."
    });
  }

  const risk = hasApk || hasBank ? 88 : 40;
  return {
    case_id: caseId,
    timestamp: new Date().toLocaleTimeString("id-ID") + " WIB",
    content_risk: risk,
    confidence: 85,
    risk_level: risk >= 75 ? "VERY HIGH RISK" : "MEDIUM RISK",
    summary:
      risk >= 75
        ? "Terdeteksi indikasi manipulasi reputasi dan penipuan siber pada target ini."
        : "Konten memerlukan kewaspadaan lebih lanjut.",
    categories: [
      { name: "Phishing Finansial", score: `${risk}%` },
      { name: "Social Engineering", score: "82%" }
    ],
    indicators:
      indicators.length > 0
        ? indicators
        : [
            {
              title: "Pola Pesan Tidak Terverifikasi",
              impact: "SEDANG",
              level: "orange",
              desc: "Pengirim menggunakan kanal tidak resmi."
            }
          ],
    initial_exposure: 10,
    evidence_type: req.type,
    source_model: "ScamGuard Client Heuristic Fallback"
  };
}
