# ScamGuard AI — Design System: Trustworthy Security Intelligence

**Version:** 1.0.0  
**Target:** IDwebhost AI HackFest 2026  
**Category:** Digital Safety & Public Good → Cyber Security & Anti Scam  
**Philosophy:** Information-rich, Border-driven, Precise, and Calm  

---

## 1. Executive Summary

ScamGuard AI menggunakan design system **"Trustworthy Security Intelligence"**: sebuah visual language yang menggabungkan prinsip modern SaaS, enterprise security dashboard, dan human-centered UX.

Identitas visual utamanya:
```text
Primary Blue (#2563EB)
+
Navy Text & Headings (#0F172A)
+
Clean Surface (#FFFFFF) on Soft Slate (#F8FAFC)
+
Subtle Borders (1px solid #E2E8F0)
+
Dominant Risk Score Typography (56–72px / 700)
+
Evidence-First UI & Progressive Disclosure
+
Action-Oriented Mitigation
```

**Prinsip Inti:**
> **"Show the evidence. Explain the risk. Understand the exposure. Guide the action."**  
> **"Security should feel calm, not scary."**

---

## 2. Brand Personality

| Attribute | Direction | Catatan Desain |
| :--- | :--- | :--- |
| **Trustworthy** | Very High | Menghindari klaim berlebihan atau vonis mutlak tanpa bukti. |
| **Professional** | Very High | Tampilan terstruktur setara produk keamanan enterprise / fintech. |
| **Calm** | High | Menghindari efek sirene, kelap-kelip merah, atau alarm yang memicu kepanikan. |
| **Human** | High | Bahasa Indonesia yang lugas, komunikatif, dan mudah dipahami pengguna awam. |
| **Technical** | Medium-High | Menampilkan detail indikator DNS, SSL, dan URL secara transparan. |
| **Friendly** | Medium | Ramah dan membantu pengguna menyelesaikan masalah langkah demi langkah. |
| **Futuristic** | Low-Medium | Tidak menggunakan tema neon cyberpunk atau efek robotik palsu. |
| **Playful** | Low | Menghindari sudut bulat berlebih (*over-rounded pills*) atau warna kartun. |

ScamGuard bukan brand yang ingin terlihat canggih melalui efek visual semata. Kecanggihan ditunjukkan melalui:
> **Informasi yang jelas + alur investigasi yang pintar.**

---

## 3. Visual Direction

**Modern SaaS Security**
Referensi visual:
* Enterprise security dashboard
* Modern SaaS & developer tools
* Financial security products

Karakteristik:
* Clean, Minimal, Structured
* Information-rich & Border-driven
* Professional typography and semantic state coloring

---

## 4. Color System

### 4.1 Brand Colors
* **Primary Blue (`#2563EB`)**: Tombol utama, navigasi aktif, tautan, focus ring, state terpilih, dan aksen brand.
* **Primary Dark (`#1D4ED8`)**: State hover dan tombol aktif.
* **Navy (`#0F172A`)**: Warna heading, logo, teks utama, dan navigasi.

### 4.2 Neutral Colors
* **Background**: `#F8FAFC` (Slate 50)
* **Surface (Cards/Panels)**: `#FFFFFF` (Pure White)
* **Border**: `#E2E8F0` (Slate 200)
* **Primary Text**: `#0F172A` (Slate 900)
* **Secondary Text**: `#64748B` (Slate 500)
* **Muted Text**: `#94A3B8` (Slate 400)

> **Aturan**: Antarmuka harus dominan menggunakan perpaduan **White + Slate + Navy**. Warna biru digunakan sebagai aksen interaktif.

### 4.3 Risk Color System (Kontekstual)
Risk color tidak boleh menjadi warna dominan seluruh halaman.
* **LOW**: `#16A34A` (Hijau Emerald)
* **CAUTION**: `#F59E0B` (Kuning Amber)
* **HIGH**: `#F97316` (Oranye)
* **VERY HIGH**: `#DC2626` (Merah Crimson)

> **Aturan Penggunaan Warna Risiko:**
> Jangan membuat seluruh latar belakang halaman menjadi merah ketika risiko tinggi. Gunakan warna risiko secara terisolasi hanya pada:
> 1. Angka skor risiko (*Risk Score*)
> 2. Badge status
> 3. Titik indikator temuan
> 4. Alert / kotak peringatan kedaruratan akun

---

## 5. Typography

* **Font Utama**: `Inter` (Fallback: `Geist`, `Segoe UI`, `system-ui`)
* **Monospace**: `JetBrains Mono` / `Menlo` (untuk URL, case ID, dan kode transaksi)

### Skala Tipografi
| Role | Ukuran | Weight | Line Height | Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | 40px | 700 | 1.15 | Headline halaman / presentasi |
| **H1** | 28px | 650 | 1.25 | Judul utama investigasi |
| **H2** | 22px | 600 | 1.30 | Sub-judul bagian (*Assessment Section*) |
| **H3** | 18px | 600 | 1.40 | Judul kartu & kelompok indikator |
| **Body** | 16px | 400 | 1.60 | Teks bacaan utama standar |
| **Body Small** | 14px | 400 | 1.50 | Penjelasan deskripsi indikator |
| **Label** | 12–13px | 500 | 1.40 | Label badge, metadata, dan timestamp |

### Tipografi Skor Risiko (*Risk Score*)
Skor risiko merupakan salah satu elemen terpenting pada halaman:
* **Ukuran Skor**: `56px – 72px`
* **Weight**: `700` (Bold pekat)
* **Format**: `82 / 100` (atau `82%`)
* **Label Status**: `VERY HIGH RISK` (12px / 700)
* **Prinsip**: Angka skor harus terlihat **jauh lebih dominan** daripada label status di bawahnya.

---

## 6. Spacing System

Sistem spasi modular berbasis 4pt/8pt grid:
```text
4px  (space-1)
8px  (space-2)
12px (space-3)
16px (space-4)
24px (space-6)
32px (space-8)
48px (space-12)
64px (space-16)
```

**Default Content Spacing:**
* **Card Padding**: `24px`
* **Section Gap**: `32px`
* **Page Padding**: `32px`

---

## 7. Border Radius

Untuk menjaga karakter **precise, bukan playful**:
* **Button**: `8px` (`rounded-[8px]`)
* **Input & Textarea**: `8px` (`rounded-[8px]`)
* **Card**: `12px` (`rounded-[12px]`)
* **Modal**: `16px` (`rounded-[16px]`)
* **Badge / Tag**: `999px` (`rounded-full`)

Hindari penggunaan radius berlebih pada kartu kontainer agar antarmuka tidak terkesan kekanak-kanakan.

---

## 8. Border & Shadow

* **Default Card**:
  ```css
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  ```
* **Shadow**: Sangat minimal. Shadow hanya digunakan untuk modal dialog, dropdown menu, popover, dan floating bars. Kartu konten biasa cukup mengandalkan batas *border* yang bersih.

---

## 9. Iconography

* Menggunakan **Lucide Icons**
* Gaya: Outline, ketebalan goresan `1.5–2px`, sudut membulat konsisten.
* **Nol Emoji**: Seluruh elemen grafis menggunakan ikon SVG teknis profesional.

| Ikon Lucide | Konteks Penggunaan |
| :--- | :--- |
| `Search` | Tombol dan kolom input investigasi |
| `Shield` | Logo brand & proteksi keamanan |
| `AlertTriangle` | Indikator risiko dan peringatan waspada |
| `FileSearch` | Pemeriksaan dokumen dan file APK |
| `Clock` | Kronologi insiden (*Incident Timeline*) |
| `Lock` | Indikator perlindungan data kredensial |
| `CreditCard` | Pengecekan transaksi perbankan |
| `FileText` | Dokumen rekap laporan kasus |
| `Upload` | Komponen upload tangkapan layar/screenshot |
| `Check` | Tindakan mitigasi yang telah terselesaikan |

---

## 10. Logo Direction

* **Konsep**: `Shield + Subtle Scan Line` (Perisai perlindungan dengan garis radar investigasi).
* **Makna**:
  * *Shield* → Proteksi dan rasa aman.
  * *Scan* → Investigasi mendalam dan analisis cerdas.
* **Bentuk**: Flat, geometris, minimalis, dan dapat diidentifikasi secara tajam pada ukuran kecil (`16×16`, `32×32`, `64×64`).
* Bekerja optimal dalam mode: Blue on white, Black on white, dan White on navy.

---

## 11. Progressive Disclosure & Primary User Flow

```text
              LANDING
                 │
                 ↓
        START INVESTIGATION
        (Clean Input Card)
                 │
                 ↓
          UPLOAD EVIDENCE
          (URL / Image / Text / Voice)
                 │
                 ↓
         ANALYSIS LOADING STATE
     (Structured Progress Checklist)
                 │
                 ↓
        ┌─────────────────┐
        │ RISK ASSESSMENT │
        │     82 / 100    │
        └─────────────────┘
                 │
                 ↓
          WHY THIS SCORE?
     (Categorized Indicators)
                 │
                 ↓
         ADAPTIVE INTERVIEW
     (Step-by-Step Questions)
                 │
                 ↓
        USER EXPOSURE (70/100)
                 │
                 ↓
         RECOMMENDED ACTION
          ┌──────┴──────┐
          ↓             ↓
      Prevention     Emergency
          │             │
          └──────┬──────┘
                 ↓
          INCIDENT REPORT
```

1. **Initial State (Uncluttered View)**: Hanya menampilkan satu kartu masukan bukti utama (*"Analyze suspicious content / Drop evidence here"*).
2. **Structured Loading State**: Menampilkan langkah transparan pemeriksaan bukti secara visual (*Evidence received → Text extracted → Visual indicators analyzed → URL evaluated → Building assessment → Preparing recommendations*).
3. **Assessment View**: Menampilkan 3 kartu metrik terpisah (*Risk Assessment*, *Confidence*, *Exposure*), uraian *Why this score?*, kemungkinan kategori, wawancara adaptif, dan protokol mitigasi.

---

## 12. Mode Kedaruratan (*Emergency Mode Protocol*)

Jika hasil wawancara adaptif menunjukkan bahwa pengguna telah memasukkan kata sandi atau kode OTP:
* Banner status bertransformasi menjadi **ACTION REQUIRED**.
* Memberikan langkah-langkah bernomor tegas:
  * `01` Jangan berikan kode verifikasi tambahan kepada siapapun.
  * `02` Segera hubungi nomor resmi bank untuk membekukan rekening/kartu ATM.
  * `03` Ganti kata sandi akun melalui perangkat yang tidak terkompromi.
* Dilengkapi tombol satu sentuhan panggilan darurat:
  * HaloBCA: `1500888`
  * Contact BRI: `14017`
  * Mandiri Call: `14000`
  * BNI Call: `1500046`
* Tombol instan membagikan rangkuman kasus ke WhatsApp keluarga untuk didampingi.
