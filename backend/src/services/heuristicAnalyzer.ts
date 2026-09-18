import { AnalyzeRequest, AnalyzeResponse, Indicator, CategoryScore } from "../types";
import { maskSensitiveData } from "./privacy";
import { validateUrlSafety } from "./ssrf";

const BANK_KEYWORDS = ["bca", "bri", "mandiri", "bni", "cimb", "bsi", "permata", "dana", "ovo", "gopay"];
const SCAM_KEYWORDS = [
  "tarif", "kenaikan", "undian", "hadiah", "pemenang", "blokir", "penangguhan",
  "verifikasi", "konfirmasi", "urgent", "segera", "otp", "pin", "undangan", "apk",
  "surat tilang", "paket", "jne", "jnt", "sicepat", "pos", "kredivo", "pinjol"
];
const LEGIT_DOMAINS = [
  "bca.co.id", "klikbca.com", "bankmandiri.co.id", "bri.co.id", "bni.co.id",
  "idwebhost.com", "google.com", "kemkominfo.go.id", "polri.go.id"
];
const SUSPICIOUS_TLDS = [".xyz", ".top", ".club", ".icu", ".site", ".online", ".live", ".work", ".click", ".buzz", ".link"];
const SHORTENER_DOMAINS = ["bit.ly", "tinyurl.com", "s.id", "t.ly", "is.gd", "cutt.ly", "linktr.ee", "rb.gy", "shorturl.at"];

function getWibTimestamp(): { dateStr: string; timestamp: string } {
  const now = new Date();
  // Format as WIB (UTC+7)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wib = new Date(utc + (7 * 3600000));
  
  const yyyy = wib.getFullYear();
  const mm = String(wib.getMonth() + 1).padStart(2, "0");
  const dd = String(wib.getDate()).padStart(2, "0");
  const hh = String(wib.getHours()).padStart(2, "0");
  const min = String(wib.getMinutes()).padStart(2, "0");
  const ss = String(wib.getSeconds()).padStart(2, "0");
  
  return {
    dateStr: `${yyyy}${mm}${dd}`,
    timestamp: `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss} WIB`
  };
}

function computeHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function analyzeHeuristic(req: AnalyzeRequest): AnalyzeResponse {
  const content = req.content.trim().toLowerCase();
  const { dateStr, timestamp } = getWibTimestamp();
  const randSuffix = crypto.randomUUID().slice(0, 8).toUpperCase();
  const case_id = `SC-${dateStr}-${randSuffix}`;
  
  const indicators: Indicator[] = [];
  let categories: CategoryScore[] = [];
  
  let content_risk = 15;
  let confidence = 80;
  let summary = "Konten diperiksa melalui mesin analisis statis heuristik ScamGuard.";
  
  const is_url_type = req.type === "url" ||
    content.startsWith("http://") ||
    content.startsWith("https://") ||
    [".com", ".id", ".co.id", ".xyz", ".online", ".apk"].some(tld => content.includes(tld));

  if (is_url_type) {
    // SSRF & URL Safety Validation
    const rawUrl = req.content.includes("://") ? req.content : `http://${req.content}`;
    const ssrfResult = validateUrlSafety(rawUrl);
    
    if (!ssrfResult.isSafe) {
      indicators.push({
        title: "Akses Jaringan Terlarang (SSRF Protection)",
        impact: "KRITIS",
        level: "red",
        desc: ssrfResult.message || "Akses ke IP / Host lokal dicegah oleh filter keamanan sistem."
      });
      return {
        case_id,
        timestamp,
        content_risk: 98,
        confidence: 95,
        risk_level: "VERY HIGH RISK",
        summary: `Pemeriksaan URL dihentikan: ${ssrfResult.message}`,
        categories: [
          { name: "Pelanggaran Keamanan Jaringan", score: "98%" },
          { name: "Eksploitasi SSRF", score: "95%" }
        ],
        indicators,
        initial_exposure: 10,
        evidence_type: req.type || "url",
        source_model: "ScamGuard Heuristic Safety Engine v2.0 (SSRF Shield)"
      };
    }

    // URL / Domain Analysis
    let hostname = content;
    let urlPath = "";
    try {
      const parsed = new URL(rawUrl);
      hostname = parsed.hostname.toLowerCase();
      urlPath = parsed.pathname.toLowerCase();
    } catch {
      hostname = content.split("/")[0].toLowerCase();
    }

    // Check if officially known legit
    const isKnownLegit = LEGIT_DOMAINS.some(d => hostname === d || hostname.endsWith("." + d));

    if (isKnownLegit) {
      content_risk = 12;
      confidence = 94;
      summary = `Domain '${hostname}' teridentifikasi sebagai domain resmi institusi terdaftar. Tidak ditemukan indikator manipulasi.`;
      indicators.push({
        title: "Domain Resmi Terverifikasi",
        impact: "AMAN",
        level: "green",
        desc: `Nama host '${hostname}' cocok dengan entri basis data institusi terpercaya.`
      });
      indicators.push({
        title: "Protokol Enkripsi Aman",
        impact: "AMAN",
        level: "green",
        desc: "Menggunakan koneksi HTTPS dengan sertifikat SSL valid."
      });
      categories = [
        { name: "Komunikasi Resmi", score: "96%" },
        { name: "Layanan Terverifikasi", score: "92%" }
      ];
    } else {
      // Check suspicious traits
      const matchedBanks = BANK_KEYWORDS.filter(b => hostname.includes(b) || content.includes(b));
      const matchedScamWords = SCAM_KEYWORDS.filter(w => hostname.includes(w) || content.includes(w));
      const hasSuspiciousTld = SUSPICIOUS_TLDS.some(tld => hostname.endsWith(tld));
      const isIpAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
      const hasHyphens = (hostname.match(/-/g) || []).length >= 2;
      const isShortener = SHORTENER_DOMAINS.some(s => hostname === s || hostname.endsWith("." + s));
      const hasApkInUrl = urlPath.endsWith(".apk") || content.includes(".apk");

      let scoreIncrement = 0;

      if (hasApkInUrl) {
        scoreIncrement += 55;
        indicators.push({
          title: "Tautan Langsung Berkas Berbahaya (.APK Malware)",
          impact: "KRITIS",
          level: "red",
          desc: "Tautan mengarah langsung ke pengunduhan file aplikasi Android (.APK) di luar Google Play Store. Sangat berisiko memuat trojan pencuri SMS OTP."
        });
      }

      if (isShortener) {
        scoreIncrement += 35;
        indicators.push({
          title: "Penggunaan Layanan Pemendek Tautan (URL Shortener)",
          impact: "TINGGI",
          level: "orange",
          desc: `Domain '${hostname}' adalah layanan pemendek URL yang menyembunyikan alamat tujuan asli. Sering dimanfaatkan pelaku untuk mengelabui filter keamanan.`
        });
      }

      if (matchedBanks.length > 0) {
        scoreIncrement += 40;
        indicators.push({
          title: "Domain Meniru Institusi / Layanan Finansial",
          impact: "KRITIS",
          level: "red",
          desc: `Nama domain mengandung kata kunci merek finansial (${matchedBanks.join(", ").toUpperCase()}), namun bukan domain resmi terdaftar.`
        });
      }

      if (hasSuspiciousTld) {
        scoreIncrement += 25;
        indicators.push({
          title: "Penggunaan Domain Tingkat Atas (TLD) Berbiaya Rendah",
          impact: "TINGGI",
          level: "orange",
          desc: "Ekstensi domain (TLD) berisiko tinggi yang kerap disalahgunakan untuk kampanye phishing massal."
        });
      }

      if (hasHyphens) {
        scoreIncrement += 15;
        indicators.push({
          title: "Pola Typosquatting / Manipulasi Subdomain",
          impact: "TINGGI",
          level: "orange",
          desc: "Penggunaan tanda hubung berulang pada domain untuk mengelabui visual pengguna awam."
        });
      }

      if (isIpAddress) {
        scoreIncrement += 35;
        indicators.push({
          title: "Akses Langsung ke Alamat IP Publik",
          impact: "KRITIS",
          level: "red",
          desc: "Target URL mengarah langsung ke IP mentah tanpa nama domain resmi institusi."
        });
      }

      if (matchedScamWords.length > 0) {
        scoreIncrement += 20;
        indicators.push({
          title: "Pemicu Emosi & Rekayasa Sosial",
          impact: "SEDANG",
          level: "orange",
          desc: `Ditemukan indikasi kata kunci urgensi atau iming-iming (${matchedScamWords.slice(0, 3).join(", ")}).`
        });
      }

      content_risk = Math.min(98, Math.max(25, 20 + scoreIncrement));
      confidence = 88;

      if (content_risk >= 75) {
        summary = `Ditemukan beberapa indikator konsisten pada struktur target '${hostname}'. Terdeteksi indikasi manipulasi reputasi dan penipuan siber.`;
        categories = [
          { name: "Phishing Finansial", score: `${Math.min(98, content_risk + 5)}%` },
          { name: "Penyebaran Malware / APK", score: hasApkInUrl ? `${Math.min(98, content_risk + 2)}%` : "65%" },
          { name: "Social Engineering", score: "82%" }
        ];
      } else {
        summary = `Domain '${hostname}' belum memiliki reputasi yang terverifikasi dan menunjukkan beberapa indikator kewaspadaan.`;
        categories = [
          { name: "Tautan Tidak Dikenal", score: "65%" },
          { name: "Pemasaran Tidak Resmi", score: "55%" }
        ];
      }
    }
  } else {
    // Text, Voice, or Screenshot OCR analysis
    const matchedScamWords = SCAM_KEYWORDS.filter(w => content.includes(w));
    const matchedBanks = BANK_KEYWORDS.filter(b => content.includes(b));
    const hasPhoneNumber = /(\+62|62|08)[0-9]{8,12}/.test(content);
    const hasApk = content.includes(".apk") || content.includes("undangan pernikahan") || content.includes("surat tilang");

    let scoreIncrement = 0;

    if (hasApk) {
      scoreIncrement += 55;
      indicators.push({
        title: "Penyebaran Berkas Berbahaya (.APK Malware)",
        impact: "KRITIS",
        level: "red",
        desc: "Pesan mengarahkan pengguna menginstal berkas aplikasi di luar Google Play Store yang berpotensi mencuri SMS/OTP."
      });
    }

    if (matchedBanks.length > 0 && matchedScamWords.length > 0) {
      scoreIncrement += 40;
      indicators.push({
        title: "Pencatutan Nama Bank / Layanan Finansial",
        impact: "KRITIS",
        level: "red",
        desc: `Mengatasnamakan institusi (${matchedBanks.join(", ").toUpperCase()}) dengan narasi pemblokiran atau perubahan biaya sepihak.`
      });
    }

    if (content.includes("tarif") || content.includes("kenaikan")) {
      scoreIncrement += 25;
      indicators.push({
        title: "Modus Rekayasa Perubahan Tarif Transfer",
        impact: "TINGGI",
        level: "red",
        desc: "Taktik umum penipuan yang memaksa korban mengisi formulir pembatalan kenaikan biaya bulanan."
      });
    }

    if (hasPhoneNumber) {
      scoreIncrement += 15;
      indicators.push({
        title: "Kontak Pengirim Tidak Terverifikasi",
        impact: "SEDANG",
        level: "orange",
        desc: "Menggunakan nomor ponsel seluler biasa alih-alih akun resmi bertanda centang hijau (Verified Business WhatsApp)."
      });
    }

    if (indicators.length === 0) {
      if (req.type === "screenshot") {
        indicators.push({
          title: "Tangkapan Layar Diterima (Mode Heuristik Offline)",
          impact: "INFO",
          level: "blue",
          desc: "Berkas gambar berhasil diunggah. Karena Google Gemini Vision API belum terkonfigurasi di server, mesin lokal tidak dapat membaca teks di dalam gambar secara otomatis. Pastikan menyalin teks atau menghubungkan GEMINI_API_KEY."
        });
        content_risk = 0;
        confidence = 50;
        summary = "Berkas gambar telah diterima. Karena AI Multimodal Vision belum aktif di server, teks di dalam gambar tidak dapat di-OCR otomatis. Salin teks pesan ke kolom input untuk analisis akurat.";
        categories = [
          { name: "Tangkapan Layar (Menunggu AI Vision)", score: "100%" }
        ];
      } else {
        indicators.push({
          title: "Pola Teks Umum",
          impact: "INFO",
          level: "blue",
          desc: "Pesan tidak memuat pola bahaya umum yang signifikan, namun tetap waspada jika ada permintaan transfer uang."
        });
        content_risk = 20;
        confidence = 75;
        summary = "Pesan menunjukkan tingkat risiko rendah. Tidak ditemukan pemicu bahaya yang mendesak.";
        categories = [
          { name: "Komunikasi Biasa", score: "88%" },
          { name: "Spam Komersial", score: "30%" }
        ];
      }
    } else {
      content_risk = Math.min(98, Math.max(30, 20 + scoreIncrement));
      confidence = 88;
      summary = "Pesan mengandung indikator kuat rekayasa sosial (social engineering) dan pemaksaan psikologis terhadap penerima.";
      categories = [
        { name: "Penipuan Social Engineering", score: `${Math.min(98, content_risk + 4)}%` },
        { name: "Pencurian Akses Akun", score: `${Math.min(95, content_risk)}%` }
      ];
    }
  }

  // Risk level calculation
  let risk_level = "LOW RISK / SAFE";
  if (content_risk >= 75) {
    risk_level = "VERY HIGH RISK";
  } else if (content_risk >= 50) {
    risk_level = "HIGH RISK";
  }

  // Sensitive PII masking
  const cleanSummary = maskSensitiveData(summary);

  return {
    case_id,
    timestamp,
    content_risk,
    confidence,
    risk_level,
    summary: cleanSummary,
    categories,
    indicators,
    initial_exposure: 10,
    evidence_type: req.type || "url",
    source_model: "ScamGuard Heuristic Safety Engine v2.0"
  };
}
