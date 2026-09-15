# ScamGuard AI

### AI Agent untuk Risk Assessment, Investigasi, dan Respons Penipuan Digital

**Version:** 2.0.0
**Target:** IDwebhost AI HackFest 2026
**Kategori:** Digital Safety & Public Good → Cyber Security & Anti Scam
**Framework Agent:** OpenClaw
**Deployment:** IDwebhost AI Hosting / Cloud VPS
**Status:** Development

---

# 1. Executive Summary

**ScamGuard AI** adalah AI Agent multimodal yang membantu pengguna memahami risiko dari komunikasi digital yang mencurigakan, melakukan investigasi interaktif, mengetahui sejauh mana pengguna telah terpapar risiko, dan mendapatkan tindakan yang sesuai.

Pengguna dapat memberikan:

* URL / link
* Screenshot
* Gambar
* Teks pesan
* Percakapan
* Voice input

ScamGuard tidak dirancang untuk memberikan vonis absolut seperti:

> "Ini pasti phishing."

Sebaliknya, sistem memberikan **Risk Score 0–100%** berdasarkan indikator yang ditemukan pada evidence.

Contoh:

```text
RISK ASSESSMENT

82%
TINGKAT RISIKO SANGAT TINGGI

Ditemukan beberapa indikator yang meningkatkan
tingkat risiko pada konten yang dianalisis.

Confidence: 86%
```

Risk Score merupakan **indikator risiko**, bukan probabilitas statistik, keputusan hukum, atau kepastian bahwa sebuah konten merupakan penipuan.

Setelah analisis awal, ScamGuard melakukan **Adaptive Interview** untuk mengetahui tindakan yang sudah dilakukan pengguna.

Contoh:

```text
Apakah Anda sudah membuka link tersebut?

[ Sudah ]    [ Belum ]
```

Jika pengguna sudah membuka link:

```text
Apakah Anda memasukkan username atau password?

[ Ya ]    [ Tidak ]
```

Jika pengguna memasukkan credential:

```text
Apakah Anda memasukkan OTP?

[ Ya ]    [ Tidak ]
```

Dengan demikian, ScamGuard tidak hanya menjawab:

> "Seberapa mencurigakan konten ini?"

tetapi juga:

> "Seberapa jauh pengguna sudah terpapar risiko dan apa tindakan yang sebaiknya dilakukan sekarang?"

---

# 2. Problem Statement

Penipuan digital semakin memanfaatkan social engineering dan dapat muncul dalam berbagai bentuk komunikasi.

Masalah utama pengguna:

1. Sulit membedakan komunikasi resmi dan komunikasi yang mencurigakan.
2. Scam dapat datang melalui URL, chat, screenshot, email, gambar, maupun voice.
3. Banyak tool berhenti pada klasifikasi sederhana seperti "phishing" atau "aman".
4. Tool analisis biasanya tidak mengetahui tindakan yang sudah dilakukan pengguna.
5. Setelah berinteraksi dengan konten mencurigakan, pengguna sering panik dan tidak tahu harus melakukan apa.
6. Bukti insiden tersebar di berbagai platform.
7. Pengguna sering tidak memahami alasan sebuah konten mendapatkan tingkat risiko tertentu.

ScamGuard menyelesaikan masalah tersebut dengan pendekatan:

```text
Analyze
   ↓
Explain
   ↓
Interview
   ↓
Assess Exposure
   ↓
Recommend Action
   ↓
Document
```

---

# 3. Product Vision

> **Help people understand digital risk before the damage gets worse.**

Versi Indonesia:

> **Membantu pengguna memahami risiko digital sebelum kerusakan menjadi lebih besar.**

ScamGuard bukan sekadar detector.

ScamGuard berfungsi sebagai **digital safety companion** yang membantu pengguna dari analisis awal sampai tindakan mitigasi.

---

# 4. Product Goals

## 4.1 Primary Goal

Membangun AI Agent yang mampu:

```text
ANALYZE
   ↓
INVESTIGATE
   ↓
ASSESS
   ↓
RESPOND
   ↓
REPORT
```

## 4.2 Secondary Goals

* Membantu pengguna awam memahami indikator risiko.
* Menghindari tuduhan atau klaim absolut.
* Memberikan Risk Score yang mudah dipahami.
* Mengetahui tindakan pengguna melalui adaptive interview.
* Memberikan tindakan mitigasi berdasarkan kondisi pengguna.
* Membuat dokumentasi insiden.
* Menjaga data sensitif pengguna.
* Menyediakan pengalaman multimodal.

---

# 5. Target Users

## Primary User

Masyarakat umum yang menerima:

* link mencurigakan
* SMS
* WhatsApp message
* email
* undangan digital
* tawaran hadiah
* lowongan kerja
* investasi
* marketplace message
* impersonation message
* banking-related communication

## Secondary User

* keluarga yang membantu anggota keluarga
* mahasiswa
* pekerja
* UMKM
* pengguna dengan literasi keamanan digital rendah

---

# 6. Product Positioning

### Traditional Detector

```text
URL
 ↓
PHISHING / SAFE
```

### ScamGuard

```text
URL / Screenshot / Chat / Voice
              ↓
        Evidence Analysis
              ↓
        Risk Assessment
              ↓
        Explain Indicators
              ↓
        Adaptive Interview
              ↓
       Exposure Assessment
              ↓
       Recommended Actions
              ↓
         Incident Report
```

Positioning:

> **ScamGuard adalah AI Agent yang membantu pengguna memahami risiko, bukan sekadar memberikan label.**

---

# 7. Core Product Concept

ScamGuard menggunakan tiga dimensi utama:

```text
┌─────────────────────────────┐
│      CONTENT RISK           │
│      0 – 100%               │
│                             │
│ Seberapa banyak indikator   │
│ risiko ditemukan?           │
└──────────────┬──────────────┘
               │
               ↓
┌─────────────────────────────┐
│      CONFIDENCE              │
│      0 – 100%                │
│                             │
│ Seberapa kuat evidence      │
│ yang tersedia?              │
└──────────────┬──────────────┘
               │
               ↓
┌─────────────────────────────┐
│      USER EXPOSURE           │
│      0 – 100%                │
│                             │
│ Seberapa jauh pengguna      │
│ sudah berinteraksi?         │
└─────────────────────────────┘
```

Ketiga nilai tersebut tidak boleh dicampur menjadi satu angka secara sembarangan.

---

# 8. Risk Score

## 8.1 Content Risk Score

Content Risk Score menunjukkan tingkat indikator risiko pada evidence.

Range:

```text
0–24%    LOW
25–49%   CAUTION
50–74%   HIGH
75–100%  VERY HIGH
```

Contoh:

```text
CONTENT RISK

82%

VERY HIGH
```

Deskripsi:

> Analisis menemukan beberapa indikator yang secara bersama-sama meningkatkan tingkat risiko pada konten ini.

---

# 9. Confidence Score

Confidence berbeda dari Risk Score.

Contoh:

```text
Risk Score
82%

Confidence
86%
```

Artinya:

* Sistem menilai indikator risikonya tinggi.
* Evidence yang tersedia cukup kuat untuk mendukung assessment tersebut.

Contoh lain:

```text
Risk Score
78%

Confidence
38%
```

Artinya:

* Ada indikator risiko yang cukup banyak.
* Namun evidence yang tersedia masih terbatas.
* Pengguna sebaiknya tidak memperlakukan hasil sebagai kepastian.

Confidence dapat dipengaruhi oleh:

* jumlah evidence
* kualitas screenshot
* kualitas OCR
* kejelasan URL
* konsistensi indikator
* ketersediaan technical signals
* konflik antar-evidence

---

# 10. User Exposure Score

User Exposure Score mengukur sejauh mana pengguna telah melakukan tindakan yang berpotensi meningkatkan dampak.

Contoh:

```text
Tidak membuka link
        ↓
10%

Membuka link
        ↓
30%

Login
        ↓
50%

Memasukkan password
        ↓
70%

Memasukkan OTP
        ↓
85%

Melakukan transaksi
        ↓
95%
```

Nilai ini **bukan probabilitas akun pasti diretas**.

Contoh output:

```text
USER EXPOSURE

70%

HIGH EXPOSURE

Anda telah melakukan beberapa tindakan
yang meningkatkan potensi dampak.
```

---

# 11. Overall Risk State

Overall Risk State tidak sekadar menjumlahkan Content Risk + Exposure.

Sistem menggunakan kombinasi:

```text
Content Risk
+
User Exposure
+
Confidence
+
Evidence Quality
```

Contoh:

```text
CONTENT RISK       82%
USER EXPOSURE      70%
CONFIDENCE         86%

OVERALL STATE
HIGH PRIORITY
```

Dengan penjelasan:

> Konten memiliki indikator risiko tinggi dan pengguna telah melakukan beberapa tindakan yang meningkatkan potensi dampak. Prioritaskan langkah pengamanan berikut.

---

# 12. Risk Assessment Output

Format utama UI:

```text
┌─────────────────────────────────┐
│       RISK ASSESSMENT           │
│                                 │
│             82%                 │
│       VERY HIGH RISK            │
│                                 │
│ Confidence: 86%                 │
└─────────────────────────────────┘
```

Kemudian:

```text
WHY?

✓ Domain tidak konsisten dengan identitas
  yang diklaim

✓ Meminta credential

✓ Menggunakan urgency language

✓ Tampilan menyerupai halaman login
```

Jangan menggunakan:

> "Website ini pasti phishing."

Gunakan:

> "Ditemukan beberapa indikator yang meningkatkan tingkat risiko."

---

# 13. Multimodal Evidence Analysis

## 13.1 URL

Input:

```text
https://example.com/account/verify
```

Analisis:

* domain
* hostname
* URL structure
* subdomain
* suspicious path
* HTTPS/TLS
* redirect
* domain mismatch
* reputation signals
* suspicious parameters

---

# 14. Screenshot Analysis

Screenshot dianalisis melalui beberapa lapisan.

## Visual Evidence

* brand impersonation
* layout
* login form
* payment instruction
* warning message
* suspicious UI

## Text Evidence

OCR digunakan untuk:

* membaca teks
* mendeteksi urgency language
* credential request
* payment request
* suspicious instruction

## Technical Evidence

Jika tersedia:

* URL
* domain
* sender information
* metadata yang relevan

Pipeline:

```text
Screenshot
    ↓
OCR
    ↓
Text Extraction
    ↓
Visual Analysis
    ↓
Evidence Aggregation
    ↓
Risk Assessment
```

---

# 15. Text / Chat Analysis

Contoh:

> "Selamat Anda mendapatkan hadiah Rp10.000.000. Klik link berikut untuk melakukan verifikasi."

Sistem mencari indikator seperti:

* urgency
* reward bait
* credential request
* payment request
* impersonation
* suspicious call-to-action
* social engineering patterns

Output:

```text
Risk Score: 76%

Indicators:
• Reward bait
• Urgency
• Verification request
• External link
```

---

# 16. Voice Analysis

Voice diproses menjadi transcript.

```text
Voice
 ↓
Speech-to-Text
 ↓
Transcript
 ↓
Evidence Analysis
 ↓
Risk Assessment
```

Voice juga dapat digunakan untuk adaptive interview.

Contoh:

> "Saya tadi sudah klik linknya."

Agent:

> "Baik. Untuk membantu menentukan tingkat paparan Anda, apakah Anda sempat memasukkan username atau password?"

---

# 17. Evidence Classification

ScamGuard menggunakan kategori kemungkinan, bukan vonis.

Possible categories:

* Banking-related
* Credential Theft
* Account Takeover
* Investment-related
* Job-related
* Prize-related
* Delivery-related
* Impersonation
* Romance-related
* Marketplace-related
* Social Engineering
* Suspicious Digital Communication
* Unknown

Output:

```text
Possible Categories:

• Credential Theft — 78%
• Brand Impersonation — 72%
• Social Engineering — 69%
```

Angka kategori tersebut merupakan **classification confidence**, bukan bukti bahwa kategori tersebut benar secara pasti.

---

# 18. Evidence Chain

Setiap Risk Score harus dapat dijelaskan.

Contoh:

```text
RISK SCORE: 82%

Evidence
│
├── Domain mismatch
│   └── High impact
│
├── Credential request
│   └── High impact
│
├── Urgency language
│   └── Medium impact
│
└── Brand impersonation
    └── Medium impact
```

Tujuannya:

> User harus dapat memahami mengapa sistem memberikan score tersebut.

---

# 19. Adaptive Interview Engine

Adaptive Interview adalah fitur pembeda utama ScamGuard.

Agent memilih pertanyaan berdasarkan:

* evidence
* risk score
* confidence
* kemungkinan kategori
* jawaban sebelumnya
* tindakan pengguna

Agent tidak menanyakan semua pertanyaan kepada semua user.

---

# 20. Adaptive Interview Flow

```text
START
  ↓
Evidence Analysis
  ↓
Risk Assessment
  ↓
Apakah user membuka link?
  │
  ├── BELUM
  │     ↓
  │   Prevention
  │     ↓
  │    END
  │
  └── SUDAH
        ↓
      Apakah login?
        │
        ├── TIDAK
        │
        └── YA
             ↓
       Apakah memasukkan password?
             │
             ├── TIDAK
             │
             └── YA
                  ↓
             Apakah memasukkan OTP?
                  │
                  ├── TIDAK
                  │
                  └── YA
                       ↓
                HIGH PRIORITY RESPONSE
```

---

# 21. User Action Events

System menyimpan event secara terstruktur:

```text
RECEIVED_MESSAGE
OPENED_LINK
VISITED_PAGE
LOGGED_IN
ENTERED_USERNAME
ENTERED_PASSWORD
ENTERED_OTP
ENTERED_CARD_DATA
MADE_TRANSACTION
GRANTED_ACCESS
DOWNLOADED_FILE
```

Tidak semua event harus terjadi.

Agent hanya menanyakan event yang relevan.

---

# 22. Emergency Mode

Emergency Mode aktif ketika User Exposure mencapai kondisi prioritas tinggi.

Contoh:

```text
⚠ HIGH PRIORITY

User Exposure: 85%

Anda telah melakukan beberapa tindakan
yang dapat meningkatkan potensi dampak.

Lakukan langkah berikut:
```

### Immediate Actions

1. Jangan memberikan OTP tambahan.
2. Jangan memberikan credential tambahan.
3. Hubungi penyedia layanan melalui kanal resmi.
4. Amankan akun melalui aplikasi/website resmi.
5. Ganti password jika diperlukan.
6. Aktifkan 2FA.
7. Periksa aktivitas login.
8. Periksa transaksi.
9. Simpan bukti.
10. Laporkan melalui kanal resmi jika diperlukan.

ScamGuard tidak meminta:

* password
* OTP
* PIN
* CVV
* private key
* recovery code
* credential rahasia

---

# 23. Evidence Vault

Setiap pemeriksaan menjadi sebuah Case.

```text
CASE #SC-2026-0001

Evidence
├── Screenshot
├── URL
├── Message
├── Sender
├── Voice Transcript
└── Analysis Result
```

Case menyimpan:

* timestamp
* evidence
* analysis
* conversation
* risk history
* interview history
* recommendations
* report

Data sensitif diminimalkan.

---

# 24. Incident Timeline

Timeline menunjukkan apa yang terjadi berdasarkan informasi yang diberikan user.

Contoh:

```text
08:31
User menerima pesan

08:34
User membuka link

08:35
User memasukkan username

08:36
User memasukkan password

08:37
User memasukkan OTP

08:38
ScamGuard memberikan HIGH PRIORITY response
```

Timeline harus membedakan:

```text
CONFIRMED BY USER
```

dan

```text
INFERRED / UNKNOWN
```

Contoh:

```text
08:37
OTP entered
Source: User statement
Status: Confirmed
```

Jangan mengarang event yang tidak diberikan user.

---

# 25. Incident Report

Report menggunakan bahasa assessment.

Contoh:

```text
SCAMGUARD CASE REPORT

Case:
SC-2026-0001

Content Risk:
82%

User Exposure:
70%

Confidence:
86%

Assessment:
HIGH PRIORITY

Possible Categories:
• Credential Theft
• Brand Impersonation
• Social Engineering

Indicators:
• Domain mismatch
• Credential request
• Urgency language
• Brand impersonation

User Actions:
✓ Opened link
✓ Entered credentials
✗ OTP status unknown

Recommended Actions:
1. Secure affected account
2. Change password through official channel
3. Review account activity
4. Contact provider if necessary
5. Preserve evidence
```

---

# 26. Bahasa Output

ScamGuard harus menghindari klaim absolut.

### Gunakan

> "Terindikasi memiliki tingkat risiko tinggi."

> "Ditemukan beberapa indikator yang meningkatkan risiko."

> "Kemungkinan terdapat pola impersonation."

> "Evidence yang tersedia belum cukup untuk memastikan."

> "Risk Score saat ini 82%."

### Hindari

> "Ini pasti scam."

> "Website ini pasti phishing."

> "Pelaku pasti melakukan tindak pidana."

> "Akun Anda pasti diretas."

---

# 27. Uncertain / Review State

ScamGuard harus boleh mengatakan:

```text
INSUFFICIENT EVIDENCE

Risk Score: 48%
Confidence: 31%

Evidence yang tersedia belum cukup kuat
untuk memberikan assessment yang lebih spesifik.

Jika Anda ingin, berikan screenshot,
URL, atau konteks pesan tambahan.
```

Ini penting agar sistem tidak memaksakan klasifikasi.

---

# 28. Safe URL Analysis

ScamGuard tidak meminta user membuka link.

Flow:

```text
User
 ↓
Submit URL
 ↓
URL Parser
 ↓
Static Analysis
 ↓
Domain / DNS / TLS
 ↓
Reputation Signals
 ↓
Evidence Aggregation
 ↓
Risk Score
```

Jika server-side URL fetching diperlukan:

* gunakan sandbox
* SSRF protection
* network isolation
* timeout
* redirect limits
* block private IP
* block localhost
* block internal network
* restrict protocols

ScamGuard tidak melakukan exploitation.

---

# 29. AI Agent Architecture

```text
                       USER
                         │
           ┌─────────────┼─────────────┐
           ↓             ↓             ↓
          WEB         WHATSAPP        VOICE
           │             │             │
           └─────────────┼─────────────┘
                         ↓
                   API / Gateway
                         ↓
                   OPENCLAW AGENT
                         │
       ┌─────────────────┼─────────────────┐
       ↓                 ↓                 ↓
 Evidence Analyst   Risk Engine     Interview Engine
       │                 │                 │
       └─────────────────┼─────────────────┘
                         ↓
                  Response Engine
                         │
             ┌───────────┼───────────┐
             ↓           ↓           ↓
        Prevention   Emergency     Report
```

---

# 30. Logical Agent Components

Semua fungsi dapat berada di dalam satu OpenClaw Agent sebagai logical skills/tools.

## Evidence Analyst

Tugas:

* memahami evidence
* OCR
* extract indicators
* evidence chain
* multimodal analysis

## Risk Engine

Tugas:

* menghitung Content Risk
* menghitung Confidence
* meng-update assessment

## Interview Engine

Tugas:

* memilih pertanyaan
* memahami jawaban
* menentukan pertanyaan berikutnya
* menghitung User Exposure

## Response Engine

Tugas:

* prevention
* emergency response
* recovery guidance

## Report Engine

Tugas:

* timeline
* evidence summary
* report generation

---

# 31. Recommended Tech Stack

| Layer           | Technology                           |
| --------------- | ------------------------------------ |
| Agent Framework | OpenClaw                             |
| AI Model        | Competition Default Model            |
| Frontend        | Next.js + TypeScript                 |
| UI              | Tailwind CSS + shadcn/ui             |
| Backend         | FastAPI + Python                     |
| Database        | PostgreSQL                           |
| Cache           | Redis Optional                       |
| OCR             | Tesseract / Available OCR API        |
| Voice           | WebRTC + STT/TTS                     |
| WhatsApp        | WhatsApp Cloud API                   |
| Reverse Proxy   | Nginx                                |
| Container       | Docker Compose                       |
| OS              | Ubuntu Server                        |
| Deployment      | IDwebhost AI Hosting / Cloud VPS     |
| SSL             | Let's Encrypt                        |
| Monitoring      | Docker logs + lightweight monitoring |

---

# 32. Backend Structure

```text
backend/
├── api/
├── agents/
├── analyzers/
│   ├── url/
│   ├── image/
│   ├── text/
│   └── voice/
├── risk/
│   ├── content_risk.py
│   ├── exposure.py
│   └── confidence.py
├── interview/
├── services/
├── models/
├── security/
└── workers/
```

---

# 33. Database

PostgreSQL.

Core tables:

```text
users
cases
evidence
analyses
risk_assessments
risk_events
interviews
user_actions
recommendations
reports
```

Contoh:

```text
cases
 ├── evidence
 ├── analyses
 ├── risk_assessments
 ├── risk_events
 ├── interviews
 ├── recommendations
 └── reports
```

---

# 34. Risk Assessment Data Model

Contoh backend response:

```json
{
  "content_risk_score": 82,
  "user_exposure_score": 70,
  "confidence": 86,
  "risk_level": "VERY_HIGH",
  "priority": "HIGH",
  "assessment": "SUSPICIOUS",
  "possible_categories": [
    {
      "name": "credential_theft",
      "confidence": 78
    },
    {
      "name": "brand_impersonation",
      "confidence": 72
    }
  ],
  "evidence": [
    {
      "type": "domain_mismatch",
      "impact": "high"
    },
    {
      "type": "credential_request",
      "impact": "high"
    },
    {
      "type": "urgency_language",
      "impact": "medium"
    }
  ],
  "user_actions": [
    "opened_link",
    "entered_password"
  ],
  "recommended_actions": [
    "secure_account",
    "change_password",
    "contact_provider"
  ]
}
```

---

# 35. Risk Calculation Principle

Risk Score tidak boleh dipresentasikan sebagai probabilitas statistik kecuali model memang telah dikalibrasi dan divalidasi untuk tujuan tersebut.

MVP menggunakan **weighted risk indicators**.

Contoh:

```text
Domain mismatch          HIGH
Credential request       HIGH
Urgency language         MEDIUM
Brand impersonation      MEDIUM
Suspicious redirect      MEDIUM
Known reputation signal  HIGH
```

Kemudian risk engine menghasilkan:

```text
0–24%      LOW
25–49%     CAUTION
50–74%     HIGH
75–100%    VERY HIGH
```

Score harus memiliki batas 0–100.

---

# 36. Confidence Calculation

Confidence mempertimbangkan:

```text
Evidence Quality
+
Evidence Quantity
+
Signal Consistency
+
Analysis Coverage
```

Contoh:

```text
URL only
↓
Confidence 42%

URL + Screenshot
↓
Confidence 68%

URL + Screenshot + Message
↓
Confidence 86%
```

Angka di atas merupakan contoh desain dan harus dikalibrasi berdasarkan dataset pengujian sebelum digunakan sebagai klaim performa.

---

# 37. Frontend

Recommended:

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
```

Core screens:

```text
Landing
 ↓
Analyze
 ↓
Risk Result
 ↓
Adaptive Interview
 ↓
Exposure Result
 ↓
Recommended Actions
 ↓
Case Report
```

UX utama:

> **Kirim → Analisis → Pahami → Jawab → Lindungi**

---

# 38. Main Dashboard

Dashboard menampilkan:

```text
Recent Cases

CASE #SC-2026-0001
Content Risk       82%
User Exposure      70%
Confidence         86%

Status:
HIGH PRIORITY
```

Jangan menggunakan dashboard:

```text
Scams Detected: 1,204
```

seolah-olah semua assessment adalah scam yang sudah terkonfirmasi.

Gunakan:

```text
Cases Analyzed
High-Risk Assessments
High-Priority Cases
Recommendations Generated
```

---

# 39. Case Detail UI

```text
CASE #SC-2026-0001

┌──────────────────────────┐
│ CONTENT RISK             │
│                          │
│          82%             │
│     VERY HIGH            │
└──────────────────────────┘

Confidence: 86%

Indicators
✓ Domain mismatch
✓ Credential request
✓ Urgency
✓ Brand impersonation

───────────────────────────

USER EXPOSURE

70%

✓ Opened link
✓ Entered username
✓ Entered password
? OTP unknown
```

---

# 40. Privacy & Security

ScamGuard menangani data yang berpotensi sensitif.

Prinsip:

* consent
* data minimization
* purpose limitation
* secure storage
* deletion mechanism
* sensitive data masking
* access control
* audit logging

---

# 41. Sensitive Data Protection

ScamGuard tidak meminta:

```text
PASSWORD
OTP
PIN
CVV
PRIVATE KEY
RECOVERY CODE
```

Jika user mengirim credential secara tidak sengaja:

```text
Jangan kirimkan credential rahasia.

ScamGuard tidak membutuhkan password,
OTP, PIN, atau kode keamanan Anda.
```

Sistem dapat melakukan masking terhadap data yang terdeteksi.

Contoh:

```text
081234567890
        ↓
0812******90
```

---

# 42. URL Security

Server-side URL analysis harus memiliki:

* SSRF protection
* private IP blocking
* localhost blocking
* DNS rebinding protection
* redirect limit
* request timeout
* protocol allowlist
* network isolation
* response size limit

Tidak boleh:

* exploitation
* hacking
* credential harvesting
* unauthorized access
* DDoS
* automated abuse

---

# 43. Rate Limiting

Rate limiting digunakan untuk:

* analysis endpoint
* upload endpoint
* voice endpoint
* report generation
* URL analysis

Tujuan:

```text
Prevent Abuse
+
Protect VPS
+
Control AI Cost
```

---

# 44. Redis

Redis bersifat optional.

Digunakan untuk:

* temporary session
* rate limiting
* background jobs
* async analysis

Jika VPS 4 GB RAM terlalu terbatas:

```text
Redis OFF
↓
Synchronous workflow
```

---

# 45. OCR

MVP:

```text
Tesseract OCR
```

Pipeline:

```text
Screenshot
 ↓
OCR
 ↓
Text Extraction
 ↓
Indicator Detection
 ↓
Risk Assessment
```

Tidak perlu menjalankan model OCR besar secara lokal jika resource VPS terbatas.

---

# 46. Voice

MVP:

```text
Browser
 ↓
MediaRecorder / WebRTC
 ↓
Speech-to-Text
 ↓
OpenClaw Agent
 ↓
Text-to-Speech
```

Future:

```text
WhatsApp Voice
PSTN
```

---

# 47. WhatsApp

WhatsApp merupakan tahap lanjutan.

Architecture:

```text
WhatsApp Cloud API
        ↓
Webhook
        ↓
FastAPI
        ↓
OpenClaw
        ↓
Response
        ↓
WhatsApp
```

Integrasi harus mengikuti ToS platform dan ketentuan kompetisi.

---

# 48. MVP Scope

## MUST HAVE

* URL analysis
* Screenshot upload
* OCR
* Evidence analysis
* Content Risk Score
* Confidence Score
* User Exposure Score
* Adaptive Interview
* Emergency Mode
* Recommended Actions
* Incident Timeline
* Incident Report
* Web interface
* OpenClaw Agent
* VPS deployment

## SHOULD HAVE

* Case history
* Evidence Vault
* PDF report
* browser voice
* multilingual UI

## NICE TO HAVE

* WhatsApp
* voice conversation
* family assistance mode
* advanced reputation sources

## DO NOT BUILD YET

* native mobile application
* custom LLM
* large local vision model
* complex ML training pipeline
* PSTN infrastructure
* massive threat intelligence database

---

# 49. Demo Scenario

Demo utama harus menunjukkan perubahan assessment dari awal sampai akhir.

## Step 1 — User Upload

User mengirim screenshot:

```text
"Akun Anda akan diblokir.
Verifikasi sekarang."
```

## Step 2 — Initial Analysis

ScamGuard:

```text
RISK ASSESSMENT

82%

VERY HIGH

Confidence: 86%
```

Indicators:

```text
✓ Brand impersonation
✓ Urgency
✓ Suspicious URL
✓ Credential request
```

Bahasa:

> "Ditemukan beberapa indikator yang meningkatkan tingkat risiko pada konten ini."

---

# 50. Step 3 — Adaptive Interview

Agent:

> "Apakah Anda sudah membuka link tersebut?"

User:

> Sudah.

Agent:

> "Apakah Anda memasukkan username atau password?"

User:

> Sudah.

Agent:

> "Apakah Anda memasukkan OTP?"

User:

> Sudah.

---

# 51. Step 4 — Exposure Assessment

UI berubah:

```text
USER EXPOSURE

85%

HIGH EXPOSURE
```

Agent:

> "Berdasarkan jawaban Anda, Anda telah melakukan beberapa tindakan yang meningkatkan potensi dampak. Prioritaskan langkah pengamanan berikut."

---

# 52. Step 5 — Emergency Response

```text
HIGH PRIORITY RESPONSE

1. Jangan berikan OTP tambahan.
2. Amankan akun melalui kanal resmi.
3. Ganti password melalui aplikasi/website resmi.
4. Periksa aktivitas login.
5. Periksa transaksi.
6. Hubungi penyedia layanan jika diperlukan.
7. Simpan bukti.
```

---

# 53. Step 6 — Incident Report

```text
SCAMGUARD CASE REPORT

Case:
SC-2026-0001

Content Risk:
82%

User Exposure:
85%

Confidence:
86%

Possible Categories:
Credential Theft
Brand Impersonation
Social Engineering

User Actions:
✓ Opened URL
✓ Entered credentials
✓ Entered OTP

Priority:
HIGH
```

---

# 54. Step 7 — Infrastructure Proof

Demo/video harus menunjukkan:

```text
Browser
   ↓
ScamGuard
   ↓
OpenClaw Agent
   ↓
VPS
```

Tampilkan:

* VPS environment
* terminal
* Docker
* OpenClaw
* backend logs
* agent workflow

Tujuan:

> Membuktikan bahwa agent benar-benar berjalan pada infrastructure kompetisi.

---

# 55. Success Metrics

## Processing

Target:

* > 95% supported evidence berhasil diproses
* URL analysis menghasilkan assessment
* screenshot berhasil diproses
* OCR menghasilkan extracted text

## Agent

* adaptive interview berjalan sesuai jawaban
* agent tidak meminta credential sensitif
* emergency response aktif pada kondisi prioritas
* report berhasil dibuat

## UX

Target:

> Pengguna dapat memahami **tingkat risiko, alasan assessment, dan tindakan berikutnya dalam <2 menit.**

---

# 56. Product Metrics

Gunakan:

```text
Cases Analyzed
High-Risk Assessments
High-Priority Cases
Evidence Processed
Recommendations Generated
Reports Generated
```

Hindari menjadikan:

```text
Scams Detected
```

sebagai KPI utama karena assessment bukan bukti final bahwa suatu konten merupakan scam.

---

# 57. Evaluation Dataset

Sebelum production, siapkan dataset internal untuk mengevaluasi:

### URL

* legitimate
* suspicious
* known malicious
* unknown

### Screenshot

* official
* suspicious
* impersonation
* ambiguous

### Message

* legitimate
* social engineering
* phishing-like
* marketing
* ambiguous

### User Action

* no interaction
* clicked
* login
* credential entry
* OTP entry
* transaction

Evaluation harus mengukur:

* false positive
* false negative
* calibration
* confidence quality
* interview correctness
* recommendation correctness

---

# 58. Safety Requirements

ScamGuard harus:

1. Tidak memberikan kepastian palsu.
2. Tidak meminta credential.
3. Tidak melakukan exploitation.
4. Tidak mengarahkan user membuka URL mencurigakan.
5. Tidak mengarang evidence.
6. Tidak mengarang tindakan user.
7. Tidak memberikan klaim hukum.
8. Tidak menyimpan data sensitif tanpa alasan dan consent.
9. Menggunakan kanal resmi untuk recovery guidance.
10. Menampilkan uncertainty jika evidence tidak cukup.

---

# 59. Limitations

ScamGuard tidak menjamin:

```text
100% SAFE
```

atau:

```text
100% SCAM
```

Risk Score adalah:

> **indikator tingkat risiko berdasarkan evidence yang tersedia.**

Confidence adalah:

> **indikator seberapa kuat evidence mendukung assessment.**

User Exposure adalah:

> **indikator sejauh mana pengguna telah melakukan tindakan yang relevan berdasarkan informasi yang diberikan.**

Ketiga nilai tersebut bukan keputusan hukum.

---

# 60. Roadmap

## Phase 1 — Foundation

* VPS
* OpenClaw
* FastAPI
* PostgreSQL
* Next.js
* authentication/session
* basic chat

## Phase 2 — Evidence Analysis

* URL analyzer
* screenshot upload
* OCR
* text extraction
* evidence analysis
* risk engine

## Phase 3 — Agent Intelligence

* adaptive interview
* exposure engine
* confidence engine
* evidence chain
* emergency mode

## Phase 4 — Case Management

* case history
* timeline
* evidence vault
* incident report
* PDF export

## Phase 5 — Multichannel

* browser voice
* WhatsApp
* voice interaction

## Phase 6 — Demo Optimization

* realistic scenario
* polished UI
* VPS monitoring
* logging
* demo recording
* documentation

---

# 61. Deployment Architecture

Target VPS:

```text
4 Core CPU
4 GB RAM
20 GB SSD
```

Architecture:

```text
                 INTERNET
                     │
                     ↓
                  NGINX
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
       Next.js              FastAPI
                                │
                                ↓
                           OpenClaw Agent
                                │
                    ┌───────────┼───────────┐
                    ↓           ↓           ↓
                 Analysis      Risk      Interview
                    │           │           │
                    └───────────┼───────────┘
                                ↓
                           PostgreSQL
```

Redis optional.

---

# 62. Docker Compose

```text
nginx
frontend
backend
openclaw
postgres
```

Optional:

```text
redis
```

Jika resource terbatas, gabungkan service yang memungkinkan.

---

# 63. Security Deployment

Minimum:

```text
HTTPS
+
Firewall
+
Rate Limiting
+
Authentication
+
SSRF Protection
+
Input Validation
+
Secret Management
+
Log Monitoring
```

Secrets tidak boleh disimpan langsung di source code.

---

# 64. User Journey

```text
USER RECEIVES SUSPICIOUS CONTENT
              ↓
       SEND TO SCAMGUARD
              ↓
       EVIDENCE ANALYSIS
              ↓
        RISK SCORE 82%
              ↓
        WHY THIS SCORE?
              ↓
       ADAPTIVE INTERVIEW
              ↓
      USER EXPOSURE 85%
              ↓
       HIGH PRIORITY
              ↓
      ACTION RECOMMENDATION
              ↓
        INCIDENT REPORT
```

---

# 65. Key Differentiator

ScamGuard bukan hanya:

```text
"Apakah ini scam?"
```

Tetapi:

```text
"Apa indikator risikonya?"
        +
"Seberapa tinggi tingkat risikonya?"
        +
"Seberapa kuat evidence-nya?"
        +
"Seberapa jauh saya sudah terpapar?"
        +
"Apa yang harus saya lakukan sekarang?"
```

Inilah nilai utama AI Agent.

---

# 66. Competitive Advantage

### 1. Multimodal

URL + screenshot + text + voice.

### 2. Explainable

Setiap score memiliki evidence.

### 3. Adaptive

Pertanyaan berubah berdasarkan kondisi user.

### 4. Exposure-Aware

Sistem memperhitungkan tindakan yang sudah dilakukan user.

### 5. Action-Oriented

Output bukan hanya score tetapi langkah mitigasi.

### 6. Case-Based

Semua evidence dapat disatukan menjadi satu case.

---

# 67. Product Tagline

### Primary

> **ScamGuard — Don't Just Detect. Understand the Risk.**

### Indonesian

> **ScamGuard — Bukan Sekadar Mendeteksi. Pahami Risikonya.**

### Alternative

> **From Suspicious Message to Safe Action.**

---

# 68. Final Product Definition

> **ScamGuard adalah AI Agent multimodal yang membantu pengguna menganalisis komunikasi digital yang mencurigakan, memahami indikator risiko, memperoleh Risk Score berbasis persentase, melakukan adaptive interview untuk mengetahui tingkat paparan pengguna, serta mendapatkan rekomendasi tindakan yang sesuai.**

ScamGuard tidak memberikan vonis absolut terhadap sebuah link, gambar, pesan, atau website.

Sistem memberikan:

```text
CONTENT RISK
      ↓
CONFIDENCE
      ↓
USER EXPOSURE
      ↓
RECOMMENDED ACTION
```

Tujuan akhirnya bukan sekadar menjawab:

> **"Apakah ini phishing?"**

Tetapi:

> **"Seberapa tinggi risikonya, apa yang membuatnya berisiko, seberapa jauh saya sudah terpapar, dan apa yang harus saya lakukan sekarang?"**

---

# 69. One-Line Pitch

> **ScamGuard adalah AI Agent yang mengubah pemeriksaan scam dari sekadar "phishing atau bukan" menjadi penilaian risiko yang explainable, adaptive, dan actionable.**

---

# 70. Demo Pitch

```text
User:
"Saya dapat pesan ini. Apakah aman?"

        ↓

ScamGuard:
"Risk Score 82%"

        ↓

"Berikut indikator yang ditemukan..."

        ↓

"Apakah Anda sudah membuka link?"

        ↓

User:
"Sudah."

        ↓

"Apakah Anda memasukkan password?"

        ↓

User:
"Sudah."

        ↓

"Apakah Anda memasukkan OTP?"

        ↓

User:
"Sudah."

        ↓

ScamGuard:
"User Exposure 85%"

        ↓

HIGH PRIORITY

        ↓

"Berikut langkah yang sebaiknya
Anda lakukan sekarang."

        ↓

Incident Report
```

---

# 71. Core Principle

> **Never overclaim. Always explain. Always provide the next safe action.**

ScamGuard tidak harus selalu berkata:

> "Ini scam."

ScamGuard harus bisa berkata:

> **"Berdasarkan evidence yang tersedia, tingkat risikonya 82%. Berikut indikator yang mendasarinya, tingkat keyakinan analisis, dan tindakan yang sebaiknya Anda lakukan."**
