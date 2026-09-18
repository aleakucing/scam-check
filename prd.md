# 🛡️ PRODUCT REQUIREMENT DOCUMENT (PRD)
# ScamGuard AI — Trustworthy Security Intelligence & Anti-Scam Response Platform
**IDwebhost AI HackFest 2026 • Kategori: Cyber Security & Anti Scam**  
*Versi: 2.0.0 | Status: Active & Living Spec | AI Core: Hermes Agent + Google Gemini Flash*

---

## 1. Ringkasan Eksekutif (*Executive Summary*)

**ScamGuard AI** adalah platform pertahanan keamanan siber dan respon mitigasi penipuan digital multi-saluran (*multi-channel*) yang dirancang khusus untuk melindungi masyarakat Indonesia—terutama kelompok rentan dan lansia—dari maraknya kejahatan rekayasa sosial, tautan *phishing* perbankan, dan dokumen aplikasi berbahaya (*malicious .APK*).

Sistem ini ditenagai oleh kombinasi **Hermes Agent** sebagai *Autonomous Security Agent Orchestrator* dan **Google Gemini Flash** sebagai *Multimodal Reasoning Backbone*, dengan akses terpadu melalui **Web Landing Page**, **Bot WhatsApp**, **Bot Telegram**, serta **Hermes CLI**.

```
                           ┌────────────────────────────────────────┐
                           │            HERMES AGENT                │
                           │   (Autonomous Security Orchestrator)   │
                           └──────────────────┬─────────────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         │                                    │                                    │
         ▼                                    ▼                                    ▼
┌──────────────────┐               ┌──────────────────┐               ┌──────────────────┐
│   WEB PLATFORM   │               │   WHATSAPP BOT   │               │   TELEGRAM BOT   │
│ (Landing & Modal)│               │ (In-Chat W/ Buttons)             │ (Inline Keyboard)│
└────────┬─────────┘               └────────┬─────────┘               └────────┬─────────┘
         │                                  │                                  │
         └──────────────────────────────────┼──────────────────────────────────┘
                                            │
                                            ▼
                           ┌────────────────────────────────────────┐
                           │      UNIFIED FASTAPI BACKEND CORE      │
                           │  • Rate Limiter (60 req/min)           │
                           │  • Client-Side & Server PII Masking    │
                           │  • Anti-SSRF Safe Sandbox              │
                           │  • Google Gemini Flash Multimodal      │
                           │  • Resilient Heuristic Fallback Engine │
                           │  • SQLite Central Evidence Vault       │
                           └──────────────────┬─────────────────────┘
                                              │
                           ┌──────────────────┴─────────────────────┐
                           │        IDWEBHOST VPS & HOSTING         │
                           │    Docker Compose + Nginx TLS Ready    │
                           └────────────────────────────────────────┘
```

---

## 2. Problem Statement & Sasaran Pengguna (*Target Audience*)

### 2.1 Problem Statement
1. **Ledakan Kejahatan Siber di WA/SMS:** Modus penipuan di Indonesia berevolusi cepat, mulai dari pencatutan institusi bank (BCA, BRI, Mandiri) dengan dalih *"kenaikan tarif transaksi"*, APK surat undangan pernikahan, hingga surat tilang elektronik ETLE.
2. **Keterbatasan Alat Konvensional:** *Link checker* biasa hanya mengecek reputasi domain, tidak bisa membaca bukti tangkapan layar (*screenshot*) obrolan, dan tidak mengevaluasi tindakan yang telah dilakukan korban.
3. **Kepanikan Pasca-Insiden (*Post-Incident Panic*):** Saat korban sudah terlanjur mengklik tautan atau mengisi data, mereka tidak tahu harus bertindak apa dalam menit-menit kritis sebelum rekening dikuras oleh pelaku.

### 2.2 Persona Sasaran
* **Persona Utama (Lansia & Orang Tua):** Butuh antarmuka yang sangat bersih, bebas istilah teknis, memiliki teks berukuran besar, didukung narasi suara otomatis (*audio TTS*), serta tombol telepon darurat langsung ke bank.
* **Persona Sekunder (Keluarga / Anak Muda):** Anak atau kerabat yang menerima kiriman pesan mencurigakan dari grup WhatsApp keluarga dan memerlukan verifikasi instan serta resume bukti kronologi resmi untuk dilaporkan ke bank atau kepolisian.

---

## 3. Fitur Utama & Kebutuhan Fungsional (*Functional Requirements*)

### 3.1 Antarmuka Beranda Web (*Web Landing Page*)
- [x] **Bagian Atas Bersih (*Ultra-Clean Above-the-Fold*):** Area pertama saat web dibuka berfokus 100% pada **Kartu Konsol Input** tanpa distraksi elemen berulang.
- [x] **Zero-Scroll Guarantee:** Input dan tombol *"Periksa Konten Bukti Sekarang"* terlihat utuh di layar monitor 1366×768 maupun 1920×1080 tanpa perlu menggulir (*scroll*).
- [x] **Area Edukasi & Informasi di Bawah (*Scrollable Below-the-Fold*):** Penjelasan cara kerja, pilar keamanan privasi PII, dan FAQ interaktif tersusun rapi di bagian bawah.
- [x] **Kontrol Aksesibilitas Lansia di Header:**
  - [x] Pemilih skala font (*A Normal*, *A+ Besar*, *A++ Sangat Besar*).
  - [x] Tombol pengalih mode: *Bahasa Sederhana (Orang Tua)* vs *Mode Teknis*.
  - [x] Tombol akses cepat *Hotline Darurat Perbankan*.

### 3.2 Multimodal Intake & Pemeriksaan Bukti
- [x] **Input Tautan (URL):** Dilengkapi tombol tempel (*paste*) 1-klik dan *Live URL Inspector* (deteksi HTTPS, pemendek tautan seperti bit.ly, ekstensi berbahaya .APK, dan TLD mencurigakan .xyz/.top).
- [x] **Input Tangkapan Layar (Screenshot / Image):** Area tarik-lepas (*drag-and-drop*), ekstraksi teks otomatis via OCR (Tesseract / Heuristic), dan pratinjau gambar.
- [x] **Input Pesan Obrolan (SMS/WA):** Kolom teks dengan penghitung karakter dan kata.
- [x] **Input Suara Lansia (Voice Ingestion):** Perekaman ucapan melalui Web Speech API yang otomatis diterjemahkan menjadi teks penyelidikan.
- [x] **Contoh Kasus Instan (Quick Presets):** Tombol 1-klik untuk menguji skenario nyata (*BCA Tarif*, *Undangan APK*, *Tilang ETLE*, *IDwebhost Resmi*).

### 3.3 Pop-Up Modal Interaktif Gaya Telepon (*Elderly Operator Modal*)
- [x] **Fokus 1 per 1 Pertanyaan:** Begitu tombol periksa ditekan, layar beralih ke modal terfokus seperti panggilan telepon asisten siber ramah lansia.
- [x] **Narasi Suara (Web Speech Audio TTS):** Pertanyaan dibacakan otomatis dengan suara santun untuk lansia yang mengalami kendala membaca teks kecil.
- [x] **Tombol Pilihan Sentuh Ramah Lansia:** Pilihan respon besar dan tegas (*"YA, SEMPAT"*, *"TIDAK / BELUM"*, *"TIDAK YAKIN"*).
- [x] **Pohon Pertanyaan Hibrida 3 Tingkat (*Adaptive Decision Tree*):**
  - [x] *Langkah 1 (Interaksi Tautan/File):* Apakah sempat membuka tautan atau memasang berkas APK?
  - [x] *Langkah 2 (Penyerahan Kredensial):* Apakah sempat mengisi formulir username, password, atau nomor kartu ATM?
  - [x] *Langkah 3 (Kompromi Kritis):* Apakah sempat menyerahkan kode OTP SMS atau mengirim uang?
  - [x] *Dynamic Context Injection:* AI secara otomatis menyisipkan nama entitas yang dicatut (misal: *"perubahan tarif BCA"*) ke dalam teks pertanyaan.

### 3.4 Agent Kepanikan Pasca-Insiden & Penyelamatan Rekening
- [x] **Tombol Panggilan 1-Klik ke Call Center Bank:** Menampilkan tombol telepon langsung yang kompatibel dengan ponsel:
  - [x] **HaloBCA:** `tel:1500888`
  - [x] **BRI Contact Center:** `tel:14017`
  - [x] **Mandiri Call:** `tel:14000`
  - [x] **BNI Call:** `tel:1500046`
- [x] **Checklist Tindakan Penyelamatan Interaktif:** Panduan darurat yang dapat dicentang langsung oleh korban (*Matikan koneksi internet HP*, *Blokir kartu ATM*, *Hapus aplikasi APK palsu*).
- [x] **Tombol Peringatkan Keluarga via WhatsApp:** Membagikan pesan peringatan otomatis ke nomor anak/keluarga.

### 3.5 Tampilan Hasil Akhir Adaptif Bertingkat (*Tiered Output*)
- [x] **Bagian Atas (Tindakan Cepat Darurat):** Menampilkan skor *Content Risk*, *Confidence Score*, *User Exposure*, serta tombol panggilan bank.
- [x] **Bagian Bawah (Laporan & Forensik Lengkap):** Menampilkan rincian indikator teknis, pola klasifikasi ancaman, dan jejak kronologi (*timeline audit*).
- [x] **Ekspor Dokumen Laporan Resmi:**
  - [x] Unduh berkas teks laporan (`.txt`).
  - [x] Salin ringkasan laporan ke papan klip (*clipboard*).
  - [x] Cetak dokumen resmi ber-kop surat bertanda tangan digital (*Print to PDF* siap serah ke polisi/bank).

### 3.6 Integrasi Bot WhatsApp & Bot Telegram
- [x] **Arsitektur Satu Pintu (*Single Unified API*):** Bot WA dan Bot Telegram terhubung ke backend FastAPI yang sama.
- [x] **Interaksi Chat Penuh di Dalam Bot (*100% In-Chat Experience*):**
  - [x] Pengguna mengirimkan foto screenshot atau teks link ke bot.
  - [x] Bot membalas dengan hasil OCR kilat dan indikasi bahaya awal.
  - [x] Bot melontarkan pertanyaan 1 per 1 melalui tombol interaktif (*Inline Keyboard* Telegram / *Interactive Buttons* WA).
  - [x] Jika status darurat tercapai, bot langsung mengirimkan nomor telepon resmi bank yang bisa langsung di-tap untuk menelpon.
  - [x] Bot menyertakan *Case ID* terdaftar yang bisa dicek silang di website.

### 3.7 Penyimpanan Data & Evidence Vault
- [x] **Penyimpanan Terpusat SQLite (*Evidence Vault*):** Setiap investigasi tersimpan dengan aman di `backend/data/scamguard_cases.db`.
- [x] **Anonimitas & Privasi:** Nomor rekening, kartu kredit 16-digit, nomor ponsel, dan OTP disensor otomatis (*PII Masking*) sebelum masuk ke database.
- [x] **Case ID Unik Berstempel Resmi:** Format `SC-YYYYMMDD-XXXX` yang dapat dicari dan dimuat kembali kapan saja.
- [x] **Penyimpanan Cepat di Browser (*LocalStorage History*):** Riwayat pemeriksaan lokal tersimpan di peramban pengguna untuk akses 1-klik.

### 3.8 Strategi Autentikasi Pengguna (*Guest-First & Passwordless*)
- [x] **Guest-First (Bebas Akses Tanpa Login):** Pemeriksaan awal dan panduan darurat 100% gratis dan bebas login agar korban tidak terhambat birokrasi saat panik.
- [ ] **Login 1-Klik / Passwordless:** Fitur login mudah (Google Sign-In / tautan WhatsApp) saat pengguna ingin mengarsipkan banyak riwayat kasus keluarga atau memantau akun dari berbagai perangkat.

---

## 4. Arsitektur AI & Integrasi Hermes Agent

### 4.1 Hermes Agent (Orchestrator)
Hermes Agent bertindak sebagai agen otonom yang mengoperasikan investigasi siber melalui modul skill resmi:
* **Lokasi Skill:** [skills/scamguard/SKILL.md](file:///C:/ibra/project/web/lomba-idwebshost/skills/scamguard/SKILL.md)
* **Pendaftaran Skill:** Terpasang secara otomatis di `~/.hermes/skills/scamguard/` melalui [setup.sh](file:///C:/ibra/project/web/lomba-idwebshost/setup.sh).
* **CLI Interaktif:**
  ```bash
  hermes chat -q "Periksa link ini: https://id-bca-verifikasi-keamanan.xyz/login"
  ```

### 4.2 Google Gemini Flash (Vision & Multimodal Engine)
* **Model Terkonfigurasi:** `gemini-1.5-flash` / `gemini-2.0-flash` / `gemini-2.5-flash`
* **Fungsi Utama:** Membaca screenshot percakapan WhatsApp/SMS secara visual, memahami manipulasi psikologis bahasa Indonesia, mengenali pemalsuan merk perbankan, dan merumuskan kalimat pertanyaan operator lansia yang kontekstual.
* **Resilient Heuristic Fallback Engine:** Jika API key belum terpasang atau kuota API tercapai, sistem secara mulus beralih ke mesin heuristik lokal sehingga aplikasi **tidak pernah gagal/error saat diuji juri lomba**.

---

## 5. Arsitektur Teknis & Deployment VPS IDwebhost

### 5.1 Spesifikasi Komponen Sistem
| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Frontend** | HTML5, Tailwind CSS, Web Speech API, Tesseract OCR | Ringan, responsif, zero-build step |
| **Backend** | Python 3.11, FastAPI, Uvicorn | Asinkron, cepat, performa tinggi |
| **AI Brain** | Hermes Agent + Google Gemini Flash API | Multimodal vision & reasoning siber |
| **Keamanan** | SSRF Validator, PII Regex Masker, Rate Limiter | Proteksi data korban & server |
| **Basis Data** | SQLite Persistent Vault | Ringan, tanpa beban overhead DB server |
| **Kontainer** | Docker & Docker Compose | Siap 1-klik jalan di VPS IDwebhost |
| **Web Server** | Nginx Reverse Proxy (HTTP/2, TLS Ready) | Caching statis & keamanan header |

### 5.2 Alur Otomasi 1-Klik di VPS IDwebhost
Deployment di VPS IDwebhost dilakukan melalui skrip terpadu [setup.sh](file:///C:/ibra/project/web/lomba-idwebshost/setup.sh):
```bash
bash setup.sh
```
Skrip otomatis mendaftarkan skill ScamGuard ke Hermes Agent, menyalin konfigurasi `.env`, membangun kontainer Docker, dan mengaktifkan Nginx.

---

## 6. Matriks Risiko 3-Dimensi (*3-Dimensional Risk Framework*)

Sistem menghitung risiko secara komprehensif menggunakan 3 indikator terpisah:

$$\text{Tingkat Bahaya Riil} = f(\text{Content Risk}, \text{Confidence Score}, \text{User Exposure})$$

1. **Content Risk (0–100%):** Seberapa berbahaya materi/pesan/link/APK tersebut secara teknis.
2. **Confidence Score (0–100%):** Tingkat kepastian data dan kekuatan indikator yang ditemukan oleh AI.
3. **User Exposure (0–100%):** Tingkat keterpaparan akun korban (berdasarkan hasil tanya-jawab modal telepon: membuka link = 35%, isi data = 70%, serahkan OTP = 90%).

---

## 7. Rencana Rilis & Status Implementasi (*Milestone Tracking*)

| Modul Fitur | Status | Catatan Verifikasi |
|---|:---:|---|
| Desain Konsol Input *Above-The-Fold* (Zero Scroll) | `[x] Selesai` | Tinggi layar ~530px, langsung terlihat utuh |
| Live URL Inspector & Deteksi APK/TLD | `[x] Selesai` | Real-time parsing host, protokol, dan badge risiko |
| Ekstraksi Gambar & Drag-Drop OCR | `[x] Selesai` | Thumbnail preview + teks terdeteksi |
| PII Masking (Sensor Nomor HP, ATM, OTP) | `[x] Selesai` | Berjalan di peramban dan backend |
| Pop-up Modal Interaktif Operator Lansia | `[x] Selesai` | Pertanyaan 1 per 1 dengan Web Speech TTS |
| Protokol Kedaruratan & 1-Click Call Bank | `[x] Selesai` | HaloBCA 1500888, BRI 14017, Mandiri 14000 |
| Ekspor Laporan Resmi Polisi/Bank (PDF) | `[x] Selesai` | Dilengkapi kop surat resmi dan tanda tangan digital |
| SQLite Evidence Vault & Endpoint Kasus | `[x] Selesai` | `GET /api/cases` dan `POST /api/analyze` |
| Integrasi Skill Hermes Agent | `[x] Selesai` | `skills/scamguard/SKILL.md` siap pakai |
| Backend API Suite & 29 Automated Tests | `[x] Selesai` | 29/29 Unit Tests lulus 100% tanpa error |
| Skrip Otomasi Deployment VPS IDwebhost | `[x] Selesai` | `setup.sh`, `docker-compose.prod.yml`, `nginx` |
| Webhook Bot Telegram & WhatsApp Terpadu | `[ ] Tahap Lanjut` | Terhubung ke FastAPI `/api/webhook/*` |
| Login 1-Klik Akun Pengguna (Google/WA) | `[ ] Tahap Lanjut` | Fitur opsional manajemen arsip keluarga |

---

## 8. Standar Kemenangan Lomba IDwebhost (*Winning Value*)

1. **Inklusivitas & Dampak Sosial:** Dirancang nyata untuk melindungi orang tua dan keluarga Indonesia yang paling sering menjadi korban kejahatan siber melalui pendekatan modal telepon ramah lansia.
2. **Kesiapan Infrastruktur VPS IDwebhost:** Arsitektur ringan, tangguh, hemat sumber daya memori, dan dilengkapi skrip otomasi deployment satu klik.
3. **Inovasi Teknologi:** Menggabungkan **Hermes Agent Orchestration**, model inferensi visual **Google Gemini Flash**, dan sistem sensor privasi **Privacy-by-Design**.
