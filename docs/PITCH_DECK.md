# ScamGuard AI (KrosCheck PRO) — Pitch Deck & Slide Presentasi
> **IDwebhost AI HackFest 2026 | Kategori: Cyber Security & Anti Scam**  
> **Target Format**: PDF Presentasi (7–10 Slide Eksekutif)  
> **Tema Visual**: Deep Violet/Navy (`#200651`), Vibrant Purple (`#681BFF`), Status Red (`#DC2626`), & Sky Blue (`#CAE9F8`).

---

## SLIDE 1: JUDUL & IDENTITAS PROYEK
* **Header**: IDwebhost AI HackFest 2026 — Kategori: Cyber Security & Anti Scam
* **Judul Utama**: **ScamGuard AI (KrosCheck PRO)**
* **Sub-judul / Tagline**: *"Trustworthy Security Intelligence: Asisten Deteksi Penipuan Siber Multidimensi & Mitigasi Penyelamatan Rekening Keluarga"*
* **Pengembang**: **ITK Industries Team**
* **Elemen Visual**:
  - Logo KrosCheck PRO (Emblem perisai verifikasi ungu-emas).
  - Tiga pilar utama: *3D Risk Scoring • Adaptive Interview • Senior Accessibility*.

---

## SLIDE 2: LATAR BELAKANG MASALAH & KELEMAHAN SOLUSI EKSIS
* **Judul Slide**: Krisis Rekayasa Sosial Siber di Indonesia & Kelemahan Detektor Konvensional
* **Poin Fakta & Data**:
  1. **Kerugian Finansial Masif**: Penipuan online di Indonesia menimbulkan kerugian puluhan triliun rupiah per tahun melalui APK phishing perbankan, undangan pernikahan digital, dan tilang ETLE.
  2. **Kelompok Rentan Tanpa Perlindungan**: Lansia dan orang tua menjadi target utama karena keterbatasan literasi digital dan kepanikan saat menerima ancaman pemblokiran rekening.
  3. **Paradigma 'Binary Verdict' yang Gagal**:
     - Detektor tautan konvensional hanya memberi label biner *"Aman"* atau *"Bahaya"*.
     - Korban yang **sudah terlanjur mengeklik tautan atau menyerahkan OTP** tidak diberikan panduan langkah darurat penyelamatan dana.
  4. **Antarmuka Rumit & Tak Ramah Keluarga**: Bahasa teknis membingungkan bagi masyarakat awam di saat-saat paling panik.

---

## SLIDE 3: SOLUSI UNIK — PENILAIAN RISIKO 3D & WAWANCARA ADAPTIF
* **Judul Slide**: Bukan Sekadar Detektor: Intelijen Responsif yang Mengutamakan Penyelamatan
* **Inovasi Inti 1: Penilaian Risiko Tiga Dimensi (3D Risk Scoring)**:
  - **Content Risk (0–100%)**: Evaluasi ancaman teknis berbasis heuristik lokal & AI.
  - **Confidence Score (0–100%)**: Derajat validitas bukti digital yang diunggah.
  - **User Exposure (0–100%)**: Derajat keterpaparan akun korban secara dinamis.
* **Inovasi Inti 2: Wawancara Adaptif 3 Tahap (Adaptive Incident State Machine)**:
  - Tahap 1: Apakah link sempat dibuka? (Paparan 35%)
  - Tahap 2: Apakah PIN/Kredensial diserahkan? (Paparan 70%)
  - Tahap 3: Apakah OTP SMS diberikan ke pelaku? (**Paparan 90% -> Mode Darurat Aktif!**)
* **Respon Cepat Kedaruratan**:
  - Tombol darurat 1-sentuhan langsung ke Call Center resmi (HaloBCA 1500888, BRI 14017, Mandiri 14000, BNI 1500046).

---

## SLIDE 4: ARSITEKTUR SISTEM, PRIVASI DATA & KETAHANAN TEKNIS
* **Judul Slide**: Arsitektur Modern, Resilien, dan Berprinsip Privacy-by-Design
* **Diagram Arsitektur Alur**:
  ```
  [Pengguna: Web / WA Bot / Telegram] 
           │
           ▼
  [Nginx Reverse Proxy + SSL Let's Encrypt] (Port 80/443)
           │
           ▼
  [Backend Bun 1.4 + Hono API + Rate Limiter]
     ├── 1. Client-Side PII Masking (Sensor Otomatis Kartu Bank, HP, OTP)
     ├── 2. SSRF Shield (Blokir Loopback, Private IP & Cloud Metadata)
     ├── 3. Hybrid Engine: Google Gemini Multimodal + Heuristik Siber Nasional
     └── 4. Evidence Vault: SQLite WAL Mode Thread-Safe Storage
  ```
* **Kelebihan Teknis Utama**:
  - **Resilient Fallback Engine**: Sistem tetap bekerja 100% normal secara offline meskipun kuota AI habis atau koneksi internet terputus.
  - **Zero-Log & PII Protection**: Data pribadi pengguna tidak pernah disimpan dalam bentuk teks polos.
  - **Performa Ekstrem**: Bun 1.4 runtime dengan latensi respons API sub-10ms.

---

## SLIDE 5: AKSESIBILITAS PUBLIK & FITUR RAMAH LANSIA
* **Judul Slide**: Dirancang Inklusif untuk Orang Tua & Seluruh Anggota Keluarga
* **Fitur Aksesibilitas Unggulan**:
  1. **Tipografi Ramah Lansia**: Pengubah ukuran font instan (100%, 125%, 150%) dengan kontras rasio WCAG AAA tinggi.
  2. **Narasi Suara AI (Text-to-Speech)**: Membacakan hasil analisis dan langkah pencegahan dalam bahasa Indonesia santun dan mudah dipahami.
  3. **Pendampingan Keluarga (WhatsApp Sync)**: Tombol 1-klik untuk meneruskan hasil analisis ke nomor WhatsApp anak/keluarga agar segera mendapat bantuan pendampingan.
  4. **Ekspor Dokumen Laporan Insiden Resmi**: Menghasilkan dokumen audit berkas insiden cetak standar A4 untuk pelaporan resmi ke kepolisian (Cyber Patrol) atau bank penyedia rekening.

---

## SLIDE 6: MODEL BISNIS, DAMPAK SOSIAL & MONETISASI BERKELANJUTAN
* **Judul Slide**: Skalabilitas Bisnis: Dari Perlindungan Publik ke Sinergi B2B Institusi Finansial
* **Model 'Freemium Public Good & B2B Threat Intelligence'**:
  - **B2C Public Tier (100% Gratis & Bebas Akses)**: Layanan mandiri bagi seluruh rakyat Indonesia melalui Web, Telegram, dan WhatsApp bot demi dampak sosial nyata.
  - **B2B FinTech & Banking API (Langganan Berbayar)**:
    - API Feed deteksi domain phishing perbankan dan nomor rekening mencurigakan secara realtime (*Early Warning Threat Intelligence*).
    - SDK integrasi aplikasi mobile banking untuk memverifikasi tautan/SMS mencurigakan sebelum dibuka nasabah.
  - **Enterprise Fraud Analytics**: Dasbor analitik tren modus penipuan siber untuk tim fraud risk manajemen perbankan dan e-commerce.

---

## SLIDE 7: LIVE DEMO VPS, REPOSITORI & KESIMPULAN
* **Judul Slide**: Kesiapan Produksi & Demonstrasi Nyata
* **Informasi Live Demo & Repositori**:
  - 🌐 **Live Demo VPS IDwebhost**: `http://103.30.146.185` (Siap diakses kapan saja oleh dewan juri)
  - 📦 **Repositori GitHub**: [github.com/aleakucing/scam-check](https://github.com/aleakucing/scam-check)
  - ⚡ **Status Pengujian**: 100% Lulus Uji Unit Test Bun API (11 Test Suites, 54 Assertions) & Svelte Check (0 Error).
  - 📱 **Multi-Kanal**: Web App Responsive • Telegram Bot Webhook • WhatsApp Webhook.
* **Pesan Penutup**:
  > *"ScamGuard AI membuktikan bahwa kecerdasan buatan dapat menjadi perisai pelindung yang humanis, menyeleksi bahaya, dan menyelamatkan masa depan finansial keluarga Indonesia."*
