import { describe, it, expect, beforeEach } from "bun:test";
import { app } from "../src/index";
import { rateLimiter } from "../src/services/rateLimiter";
import { maskSensitiveData } from "../src/services/privacy";
import { validateUrlSafety } from "../src/services/ssrf";

describe("ScamGuard Bun API & Security Suite", () => {
  beforeEach(() => {
    rateLimiter.reset();
  });

  it("GET /api/health returns healthy system status", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("healthy");
    expect(body.ssrf_protection).toBe("active");
    expect(body.pii_masking).toBe("active");
  });

  it("POST /api/analyze flags phishing URL with high risk", async () => {
    const res = await app.request("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "url",
        content: "http://bca-tarif-kenaikan-promo.xyz/login.apk"
      })
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.case_id).toBeDefined();
    expect(body.content_risk).toBeGreaterThanOrEqual(75);
    expect(body.risk_level).toBe("VERY HIGH RISK");
    expect(body.indicators.length).toBeGreaterThan(0);
  }, 15000);

  it("POST /api/analyze identifies legitimate institution domain as safe", async () => {
    const res = await app.request("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "url",
        content: "https://bca.co.id/id/individu"
      })
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.content_risk).toBeLessThan(30);
    expect(body.risk_level).toBe("LOW RISK / SAFE");
  }, 15000);

  it("POST /api/analyze blocks SSRF cloud metadata attacks", async () => {
    const res = await app.request("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "url",
        content: "http://169.254.169.254/latest/meta-data/"
      })
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.content_risk).toBe(98);
    expect(body.risk_level).toBe("VERY HIGH RISK");
    expect(body.source_model).toContain("SSRF Shield");
  });

  it("POST /api/interview calculates multi-step exposure accurately", async () => {
    // Step 1: opened link -> 35
    const step1 = await app.request("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        case_id: "TEST-CASE-001",
        opened_link: true,
        entered_credentials: null,
        entered_otp: null
      })
    });
    expect(step1.status).toBe(200);
    const b1 = await step1.json();
    expect(b1.user_exposure).toBe(35);
    expect(b1.is_emergency).toBe(false);

    // Step 2: entered credentials -> 70
    const step2 = await app.request("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        case_id: "TEST-CASE-001",
        opened_link: true,
        entered_credentials: true,
        entered_otp: null
      })
    });
    const b2 = await step2.json();
    expect(b2.user_exposure).toBe(70);
    expect(b2.is_emergency).toBe(true);

    // Step 3: entered OTP -> 90 critical
    const step3 = await app.request("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        case_id: "TEST-CASE-001",
        opened_link: true,
        entered_credentials: true,
        entered_otp: true
      })
    });
    const b3 = await step3.json();
    expect(b3.user_exposure).toBe(90);
    expect(b3.is_emergency).toBe(true);
    expect(b3.actions.length).toBeGreaterThan(0);
  });

  it("Evidence Vault: stores and retrieves cases by ID and lists recent", async () => {
    // First analyze
    const analyzeRes = await app.request("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "text",
        content: "Surat tilang ETLE kepolisian mohon unduh file surat_tilang.apk"
      })
    });
    const analyzeBody = await analyzeRes.json();
    const caseId = analyzeBody.case_id;

    // Retrieve from GET /api/cases/:id
    const getRes = await app.request(`/api/cases/${caseId}`);
    expect(getRes.status).toBe(200);
    const caseData = await getRes.json();
    expect(caseData.case_id).toBe(caseId);
    expect(caseData.evidence_content).toContain("surat_tilang.apk");

    // List recent
    const listRes = await app.request("/api/cases?limit=5");
    expect(listRes.status).toBe(200);
    const listData = await listRes.json();
    expect(Array.isArray(listData)).toBe(true);
    expect(listData.some((c: any) => c.case_id === caseId)).toBe(true);
  }, 15000);

  it("PII Masking masks Indonesian sensitive phone, card, and OTP patterns", () => {
    const raw = "Silakan transfer ke 081234567890 atau kartu 4532-1234-5678-9012 dengan OTP 987654";
    const masked = maskSensitiveData(raw);
    expect(masked).not.toContain("081234567890");
    expect(masked).not.toContain("4532-1234-5678-9012");
    expect(masked).not.toContain("987654");
    expect(masked).toContain("0812******90");
    expect(masked).toContain("4532-****-****-9012");
    expect(masked).toContain("OTP ******");
  });

  it("SSRF Protection flags loopback, private IPs, and metadata targets", () => {
    expect(validateUrlSafety("http://127.0.0.1:8000").safe).toBe(false);
    expect(validateUrlSafety("http://localhost/admin").safe).toBe(false);
    expect(validateUrlSafety("http://192.168.1.1").safe).toBe(false);
    expect(validateUrlSafety("http://10.0.0.1").safe).toBe(false);
    expect(validateUrlSafety("https://google.com").safe).toBe(true);
  });

  it("POST /api/webhook/telegram responds with structured alert", async () => {
    const res = await app.request("/api/webhook/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          chat: { id: 123456 },
          text: "/check http://bca-palsu.xyz"
        }
      })
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("success");
    expect(body.reply_text).toContain("HASIL ANALISIS SCAMGUARD AI");
    expect(body.reply_text).toContain("HaloBCA");
  }, 15000);

  it("POST /api/webhook/whatsapp responds with structured alert", async () => {
    const res = await app.request("/api/webhook/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "628123456789",
        text: "Undangan Pernikahan digital mohon buka link http://wedding-undangan.apk"
      })
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("success");
    expect(body.reply_text).toContain("SCAMGUARD AI - HASIL DETEKSI");
  }, 15000);

  it("GET / and /result serves Svelte SPA HTML to browsers", async () => {
    const res = await app.request("/", {
      headers: { Accept: "text/html" }
    });
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain("KrosCheck");

    const resResult = await app.request("/result");
    expect(resResult.status).toBe(200);
    const htmlResult = await resResult.text();
    expect(htmlResult).toContain("KrosCheck");

    const resFaq = await app.request("/faq");
    expect(resFaq.status).toBe(200);
    const htmlFaq = await resFaq.text();
    expect(htmlFaq).toContain("KrosCheck");
  });

  it("Security Audit: Rejects invalid or malicious image uploads (magic bytes check)", async () => {
    // Malicious SVG upload payload
    const fakeSvg = Buffer.from("<svg onload='alert(1)'></svg>").toString("base64");
    const res = await app.request("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "screenshot",
        content: "Cek gambar mencurigakan",
        image_base64: `data:image/svg+xml;base64,${fakeSvg}`
      })
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.detail).toContain("Format gambar tidak didukung");
  });

  it("Security Audit: Accepts valid PNG image upload", async () => {
    // 1x1 valid PNG base64
    const validPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    const res = await app.request("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "screenshot",
        content: "Tangkapan layar bukti transfer",
        image_base64: `data:image/png;base64,${validPng}`
      })
    });
    expect(res.status).toBe(200);
  }, 15000);

  it("Security Audit: Server-side PII masking occurs BEFORE data is saved to SQLite Vault", async () => {
    const rawSensitive = "Transfer ke BCA 1234567890 atas nama Budi kode OTP 654321 email korban@gmail.com";
    const res = await app.request("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "text",
        content: rawSensitive
      })
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    const caseId = body.case_id;

    // Check retrieved case from SQLite
    const caseRes = await app.request(`/api/cases/${caseId}`);
    expect(caseRes.status).toBe(200);
    const caseRecord = await caseRes.json();
    expect(caseRecord.evidence_content).not.toContain("1234567890");
    expect(caseRecord.evidence_content).not.toContain("654321");
    expect(caseRecord.evidence_content).not.toContain("korban@gmail.com");
    expect(caseRecord.evidence_content).toContain("OTP ******");
  }, 15000);

  it("Security Audit: Case IDs have high-entropy hex suffix to prevent enumeration", async () => {
    const res1 = await app.request("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "text", content: "Kasus uji 1" })
    });
    const b1 = await res1.json();
    const res2 = await app.request("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "text", content: "Kasus uji 2" })
    });
    const b2 = await res2.json();

    // High entropy: SC-YYYYMMDD-XXXXXXXX (8 hex characters)
    expect(b1.case_id).toMatch(/^SC-\d{8}-[A-F0-9]{8}$/);
    expect(b2.case_id).toMatch(/^SC-\d{8}-[A-F0-9]{8}$/);
    expect(b1.case_id).not.toBe(b2.case_id);
  }, 15000);

  it("Input Validation: Rejects gibberish, keyboard mashes, and repeated characters with HTTP 400", async () => {
    const invalidInputs = [
      "asdfghjkl",
      "qwertyuiop",
      "aaaaaaa",
      "ngawur",
      "123",
      "http:// invalid domain.com",
      "asdasdasd"
    ];

    for (const input of invalidInputs) {
      const res = await app.request("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", content: input })
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.detail).toBeDefined();
    }
  });

  it("Input Validation: Accepts clean normal text and rates it accurately as SAFE (low risk)", async () => {
    const res = await app.request("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "text",
        content: "Selamat pagi rekan-rekan, rapat koordinasi bulanan akan dimulai pukul 10.00 di ruang rapat."
      })
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.content_risk).toBeLessThanOrEqual(10);
    expect(body.risk_level).toBe("LOW RISK / SAFE");
    expect(body.indicators[0].impact).toBe("AMAN");
  }, 15000);
});
