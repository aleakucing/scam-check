# ScamGuard AI — Project Checklist & Roadmap
> **IDwebhost AI HackFest 2026 | Kategori: Cyber Security & Anti Scam**  
> Status Pelacakan Progres Pengembangan, Kesiapan Fitur, dan Kebutuhan Submission Lomba.

---

## 🟢 1. Fitur yang Sudah Selesai (Completed)

- [x] **Redesain UI Modern & Ramah Pengguna (Inspirasi Scamwise)**
  - [x] Palet warna fungsional Dark Purple (`#200651`), Bright Purple (`#681BFF`), dan Sky Blue (`#cae9f8`).
  - [x] Layout *Centered Intake Capsule* yang bersih dan intuitif.
  - [x] Seksi gelap *How ScamGuard AI Works* dengan kartu interaktif.
  - [x] *FAQ Accordion* interaktif dan *Trust Badges* (Zero-Log, PII Masking, Open Source, Heuristics Engine).
  - [x] Zero emojis informal; seluruh ikon menggunakan SVG Lucide yang presisi.

- [x] **Multimodal Evidence Intake**
  - [x] Input Tautan (URL) dengan *Live URL Inspector* real-time (protokol, domain, risiko TLD).
  - [x] Input Screenshot / Gambar dengan drag-and-drop dan visual preview.
  - [x] Input Pesan Teks / Chat dengan karakter counter dan quick paste.
  - [x] Input Suara (Browser Speech-to-Text dengan tombol rekam interaktif).
  - [x] Tombol preset contoh kasus instan (*Tilang ETLE APK*, *Phishing BCA*, *Undian Palsu*, *Domain Resmi*).

- [x] **Mesin Analisis Cerdas (AI + Heuristic Fallback)**
  - [x] Integrasi Google Gemini 1.5 Flash multimodal untuk analisis konteks rekayasa sosial mendalam.
  - [x] *Indonesian Cyber Heuristics Rules Engine* mandiri (deteksi APK, typosquatting bank, urgensi palsu, pemendek URL).
  - [x] Penilaian Risiko Tiga Dimensi:
    - [x] **Content Risk (0–100%)**
    - [x] **Confidence Score (0–100%)**
    - [x] **User Exposure (0–100%)**

- [x] **Fitur Khusus Aksesibilitas Lansia & Keluarga**
  - [x] Tombol pengubah ukuran teks instan (Standar 100%, Besar 125%, Ekstra Besar 150%).
  - [x] Narasi Suara AI (Text-to-Speech Web Speech API) untuk membacakan hasil analisa risiko.
  - [x] Tombol 1-klik *"Kirim ke Anak/Keluarga via WhatsApp"* dengan template pesan otomatis.
  - [x] Hotline darurat 1-sentuhan (Direct dial HaloBCA 1500888, BRI 14017, Mandiri 14000, BNI 1500046).

- [x] **Adaptive Interview & Emergency State Machine**
  - [x] Wawancara adaptif 3 tahap (Buka link -> Masukkan password -> Masukkan OTP).
  - [x] Dynamic risk elevation saat kredensial/OTP terindikasi bocor.
  - [x] *Emergency Mode Banner* dengan checklist mitigasi darurat interaktif.
  - [x] *Incident Timeline* kronologis berbasis aksi pengguna.

- [x] **Keamanan & Privasi (Privacy-by-Design)**
  - [x] PII Masking otomatis (sensor nomor HP Indonesia, nomor kartu debit/kredit, kode OTP).
  - [x] SSRF Protection di backend (blokir localhost, loopback, private IP, AWS/GCP metadata IP).
  - [x] URL shortener expansion yang aman terhadap redirect tak terbatas.

- [x] **Dokumen Laporan Kasus Resmi**
  - [x] Modal Laporan Insiden Resmi dengan nomor kasus unik (`SG-YYYYMMDD-XXXX`).
  - [x] Salin ke Clipboard format laporan terstruktur.
  - [x] Unduh laporan format text (`.txt`).

- [x] **Subpage Lengkap & Routing SPA Mandiri**
  - [x] Halaman `/how-it-works` (Penjelasan 4 langkah audit, arsitektur AI, dan pertahanan siber).
  - [x] Halaman `/faq` (Pusat tanya jawab interaktif dengan pencarian dan filter kategori).
  - [x] Halaman `/download` (Akses multi-kanal: Web PWA, Bot Telegram, dan Bot WhatsApp).
  - [x] Halaman `/trends` (Papan intelijen tren scam Indonesia dengan pemicu uji coba langsung).
  - [x] Halaman `/about` (Latar belakang misi IDwebhost HackFest & nilai-nilai dasar).
  - [x] Halaman `/privacy` & `/terms` (Dokumentasi hukum komitmen Zero-Log & PII Protection).

- [x] **Kualitas Kode & Pengujian**
  - [x] 11 Test Suites Bun API otomatis (`bun test`) dengan 54 assertions status 100% PASS.
  - [x] Svelte Check (`bun run check`) dan Vite build status 100% PASS (0 error, 0 warning).
  - [x] Dockerfile & Docker Compose dengan Nginx reverse proxy siap pakai.

---

## 🟡 2. Prioritas Tinggi: Kesiapan VPS & Live Demo Juri

- [x] **Format Cetak / Ekspor PDF Resmi Berstandar Cetak (Print to PDF)**
  - [x] Tambahkan stylesheet cetak `@media print` untuk format A4 audit resmi.
  - [x] Kop resmi instansi (ScamGuard AI & IDwebhost HackFest), nomor kasus, dan status audit terverifikasi.
  - [x] Blok tanda tangan pelapor/korban dan verifikasi kriptografis AI Agent.
  - [x] Tombol *"Cetak Dokumen / PDF"* dengan penamaan otomatis berkas PDF (`Laporan-Audit-ScamGuard-CaseID`).

- [x] **Arsitektur SSL / HTTPS & Konfigurasi Nginx Production VPS**
  - [x] File konfigurasi `nginx/production.conf` siap pakai dengan sertifikat Let's Encrypt, TLSv1.2/v1.3, dan HTTP->HTTPS auto-redirect.
  - [x] `docker-compose.prod.yml` dengan mapping port 80 & 443 serta volume sertifikat SSL.
  - [x] Script otomasi sekali jalan `scripts/setup_vps_ssl.sh` untuk instalasi Certbot, pendaftaran SSL domain, dan peluncuran container di VPS.
  - [x] Script diagnostik `scripts/verify_vps.sh` untuk pengecekan Docker, port 80/443, dan kesehatan endpoint API.

- [x] **Konfigurasi Environment Production (.env)**
  - [x] Template `.env.example` terstandarisasi dengan instruksi konfigurasi `GEMINI_API_KEY`, environment production, dan rate limiting.

---

## 🔵 3. Fitur Lanjutan & Penyempurnaan Teknis

- [x] **Database Persistence & Evidence Vault (PRD Section 33 & 34)**
  - [x] Database relasional SQLite persisten (`backend/data/scamguard_cases.db`) dengan WAL mode thread-safe.
  - [x] Auto-save kasus saat `/api/analyze` dipanggil dan auto-update status paparan saat `/api/interview` dijalankan.
  - [x] API endpoint `GET /api/cases` (daftar kasus terbaru) dan `GET /api/cases/{case_id}` (detail lengkap kasus).
  - [x] Unit test komprehensif (`backend/tests/test_case_store.py`).

- [x] **Fallback OCR Gambar di Sisi Browser (PRD Section 45)**
  - [x] Integrasi Tesseract.js (Indonesian + English OCR) di sisi peramban saat drag-drop berkas gambar.
  - [x] Fallback heuristik cerdas jika offline atau tanpa koneksi internet.

- [x] **Rate Limiting & Perlindungan Anti-Abuse (PRD Section 43)**
  - [x] In-memory Sliding Window Rate Limiter 60 req/menit per IP pada endpoint sensitif (`/api/analyze`, `/api/report`).
  - [x] Respons standar HTTP 429 Too Many Requests dengan header `Retry-After: 60`.
  - [x] Unit test isolasi IP dan limit per menit (`backend/tests/test_rate_limiter.py`).

---

## 🟣 4. Kebutuhan Berkas Lomba (Submission Deliverables)

- [x] **Naskah & Storyboard Video Demonstrasi Produk (Durasi 3–5 Menit)**
  - [x] Panduan lengkap & script rekaman: [`docs/VIDEO_DEMO_SCRIPT.md`](docs/VIDEO_DEMO_SCRIPT.md).
  - [x] Skenario 1: Input URL phising perbankan atau drag-drop screenshot surat tilang APK.
  - [x] Skenario 2: Penjelasan skor risiko 3 dimensi (Content Risk, Confidence, Exposure).
  - [x] Skenario 3: Simulasi korban panik melalui Adaptive Interview (pilihan *"Sudah masukkan OTP"*).
  - [x] Skenario 4: Tampilan Emergency Mode, checklist pengamanan dana, dan kontak darurat bank.
  - [x] Skenario 5: Fitur ramah lansia (perbesar font, narasi suara, tombol kirim WA keluarga).
  - [x] Skenario 6: Ekspor dokumen laporan insiden resmi.
  - [ ] *Perekaman video fisik (MP4) oleh tim peserta.*

- [x] **Draft Naskah & Kerangka Pitch Deck (PDF 5–10 Halaman)**
  - [x] Dokumen slide presentasi: [`docs/PITCH_DECK.md`](docs/PITCH_DECK.md).
  - [x] Halaman 1: Judul Proyek, Kategori, Tim, dan Tagline.
  - [x] Halaman 2: Latar Belakang Masalah (Tingginya korban scam lansia & kelemahan detektor biner biasa).
  - [x] Halaman 3: Solusi Unik ScamGuard AI (Risk Score 3D & Wawancara Adaptif).
  - [x] Halaman 4: Arsitektur Sistem & Privasi Data (Zero-log, PII Masking, SSRF Shield).
  - [x] Halaman 5: Fitur Aksesibilitas Publik (Senior accessibility & pendampingan keluarga).
  - [x] Halaman 6: Rencana Monetisasi / Dampak Sosial (B2B API perbankan & Public Good).
  - [x] Halaman 7: Link Demo Live di VPS & Repositori GitHub.
  - [ ] *Desain grafis slide (Canva/PPT/Marp) dan ekspor ke PDF oleh tim peserta.*

- [x] **Finalisasi Dokumentasi Repositori GitHub**
  - [x] Perbarui bagian *About* repositori dengan deskripsi menarik dan tautan live demo VPS.
  - [x] Tambahkan panduan deployment Bun, Hono, dan Svelte 5 di `README.md`.
  - [x] Rekomendasi topik (*topics*): `hackfest-idwebhost`, `ai-agent`, `cyber-security`, `anti-scam`, `bun`, `hono`, `svelte5`, `tailwind-css`, `gemini-api`.

