# 🛡️ Design Spec: Refactor Frontend ke Svelte 5 & Backend ke Bun (Hono)

**Proyek:** ScamGuard AI / KrosCheck PRO • IDwebhost AI HackFest 2026  
**Tanggal:** 17 September 2026  
**Status:** Approved by User  
**Arsitektur Dipilih:**
- **Frontend:** Svelte 5 + Vite (SPA dengan rute `/` dan `/result`)
- **Backend:** Bun Runtime + Hono Framework (TypeScript + `bun:sqlite`)
- **Legacy:** Backend Python FastAPI & prototype HTML diarsipkan utuh

---

## 1. Tujuan Refaktor & Ruang Lingkup (*Scope*)

Refaktor ini memodernisasi stack ScamGuard AI menjadi:
1. **Backend Ultra-Cepat**: Menggantikan Python FastAPI dengan **Bun 1.4 + Hono**, menghasilkan *throughput* lebih tinggi, *cold start* instan, *zero-dependency* SQLite berkat `bun:sqlite`, dan tipe data yang *end-to-end type-safe* dengan TypeScript.
2. **Frontend Komponen Reaktif**: Menggantikan berkas HTML statis tunggal dengan **Svelte 5** (menggunakan fitur *Runes* `$state`, `$derived`, `$effect`), memecah antarmuka menjadi komponen modular (*HeroInput*, *RiskMatrix*, *OperatorModal*, *AdaptiveInterview*, *Checklist*), dan mendukung transisi instan antar halaman (`/` dan `/result`).
3. **100% Feature Parity**: Menjamin seluruh fitur yang telah dibangun dan diuji tetap berfungsi utuh:
   - Evaluasi 3-Dimensi: *Content Risk*, *Confidence Score*, *User Exposure*.
   - Analisis Multimodal: Ekstraksi gambar/screenshot OCR + Tautan/Teks + Google Gemini Flash API + Heuristic Fallback Engine.
   - PII Masking: Sensor otomatis nomor kartu ATM 16-digit, nomor HP, dan kode OTP di browser dan backend.
   - *Senior-Friendly Voice Operator Modal*: Narasi suara Web Speech API dan panggilan cepat 1-klik bank resmi (*HaloBCA 1500888, BRI 14017, Mandiri 14000*).
   - Checklist Mitigasi Kedaruratan & Ekspor Dokumen Laporan (PDF, TXT, Clipboard, WhatsApp Keluarga).
   - Multi-channel Bot Webhook (*Telegram* & *WhatsApp*).
   - Automated Unit Tests & Integration Tests.

---

## 2. Arsitektur Backend: Bun + Hono

### 2.1 Spesifikasi Komponen
- **Runtime:** Bun 1.4.2 (JavaScript / TypeScript native engine)
- **Framework:** Hono v4 (Ultra-fast, lightweight web framework)
- **Database:** `bun:sqlite` (In-memory & disk SQLite vault di `backend-bun/data/scamguard_cases.db`)
- **AI Core:** Google Gemini API (Multimodal reasoning) + Built-in Heuristic Engine (100% offline fallback)
- **Security:** In-memory Rate Limiter (60 req/min/IP), Anti-SSRF private IP filter, PII Regex Masking.

### 2.2 Endpoint API (1:1 Identik dengan FastAPI)
1. `GET /api/health` -> Status engine, version, active protections
2. `POST /api/analyze` -> Menerima `{ type, content, image_base64 }`, mengembalikan skor 3D, indikator, dan ringkasan AI
3. `POST /api/interview` -> Menerima `{ case_id, opened_link, entered_credentials, entered_otp }`, mengembalikan kalkulasi `user_exposure`
4. `POST /api/report` -> Menerima data kasus, mengembalikan teks laporan resmi dengan PII tersensor
5. `GET /api/cases` -> Mengambil 15 riwayat kasus terbaru dari SQLite
6. `GET /api/cases/:id` -> Mengambil detail 1 kasus berdasarkan Case ID
7. `POST /api/webhook/telegram` -> Webhook bot Telegram (mengembalikan format pesan audit siber)
8. `POST /api/webhook/whatsapp` -> Webhook bot WhatsApp

---

## 3. Arsitektur Frontend: Svelte 5 + Vite

### 3.1 Struktur Komponen Svelte
- `App.svelte`: Router sederhana berbasis hash/path untuk `/` (Landing) dan `/result` (Hasil Investigasi).
- `routes/LandingPage.svelte`:
  - Hero Section dengan Emblem, Title, dan Input Console Card.
  - Dukungan Upload Gambar + OCR.
  - Textarea interaktif dengan tombol "Periksa sekarang".
  - Section edukasi: *Cara Kerja*, *Kategori Ancaman*, *Unduh Aplikasi*, *FAQ*, dan *Footer*.
- `routes/ResultPage.svelte`:
  - Header dengan tombol *← Kembali*, Riwayat Kasus, dan Hotline 1500888.
  - Evidence Banner dengan sensor PII.
  - 3 Core Cards Matriks Risiko: Content Risk (64px dominant), Confidence, User Exposure.
  - Rincian Indikator Teknis (*Mengapa Skor Ini Diberikan*).
  - Wawancara Bertingkat Interaktif (Step 1, Step 2, Step 3).
  - Modal Operator Telepon Lansia 1-per-1 (Audio narasi TTS otomatis).
  - Protokol Penyelamatan Akun & Checklist Darurat.
  - Cetak PDF, Unduh TXT, dan Bagikan ke WA Keluarga.

### 3.2 State Management (Svelte 5 Runes)
- `$state` untuk reactive payload bukti dan hasil audit.
- Sinkronisasi dengan `sessionStorage` (`scamguard_query`) agar perpindahan dari `/` ke `/result` berjalan instan.
- `localStorage` untuk arsip 10 kasus terakhir di perangkat pengguna.

---

## 4. Rencana Pengujian & Verifikasi (*Verification Plan*)

1. **Backend Bun Test Suite (`bun test`)**:
   - `tests/api.test.ts`: 15+ test cases yang menguji seluruh endpoint, validasi input kosong, SSRF protection, PII masking, rate limiting, dan SQLite persistence.
2. **Frontend Build & Integration Test**:
   - `bun run build` pada frontend Svelte untuk membuktikan zero error kompilasi TypeScript/Svelte.
   - Verifikasi interaksi API antara frontend Svelte dan backend Bun.
3. **Dokumentasi & Skrip**:
   - Skrip start satu baris untuk Bun backend dan Svelte frontend.
