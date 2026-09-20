# ScamGuard AI — Design System: Trustworthy Security Intelligence & Solid Cyber Blue

**Version:** 2.2.0  
**Target:** IDwebhost AI HackFest 2026  
**Category:** Cyber Security & Anti Scam  
**Philosophy:** Information-rich, Border-driven, Precise, Solid, and Calm (Zero Gradients, Zero Emojis)

---

## 1. Executive Summary & Core Rules

ScamGuard AI (KrosCheck PRO) menerapkan sistem desain **"Trustworthy Security Intelligence"** yang mengombinasikan ketelitian antarmuka keamanan siber kelas enterprise dengan kemudahan akses bagi seluruh lapisan masyarakat (khususnya orang tua dan lansia).

### Aturan Utama Sistem Desain:
1. **Zero Gradients (Solid Precision)**: Tidak ada efek gradasi warna (`linear-gradient`, `radial-gradient`, atau class Tailwind `bg-gradient-*`) pada teks, kartu, tombol, background aura, maupun scanner bar. Semua elemen menggunakan warna solid dengan batas kontras tajam.
2. **Zero Emojis**: Menggunakan ikon garis presisi teknis (Lucide Icons / Phosphor Icons SVG stroke 1.5–2px). Seluruh emoji informal dilarang keras pada antarmuka produksi.
3. **Above-the-Fold Strict Hero**: Bagian konsol input utama berukuran minimal satu layar penuh (`min-h-[calc(100vh-5rem)]`), memastikan pengguna pertama kali langsung fokus pada pemeriksaan tanpa terdistraksi oleh daftar fitur di bawahnya (*below the fold*).
4. **Zero Intake Clutter**: Menghilangkan banner peringatan sekunder atau teks bertele-tele di atas konsol masukan bukti agar alur interaksi tetap bersih, tenang, dan efisien.
5. **Senior Accessibility First**: Target sentuh tombol tindakan minimal **`48px` hingga `72px`**, kontras teks WCAG AAA tinggi, pengubah ukuran huruf instan (100%, 125%, 150%), serta narasi suara (Text-to-Speech) bahasa Indonesia berkecepatan 0.90x.
6. **Isolated Risk Context**: Warna status risiko (Merah Bahaya, Oranye Waspada, Hijau Aman) tidak boleh membanjiri latar belakang aplikasi secara global; warna risiko hanya boleh diisolasi di dalam indikator skor, badge status, dan kartu audit relevan.

---

## 2. Palet Warna & Semantic Token Mapping

Sistem warna dikonfigurasi secara sentral pada `frontend/tailwind.config.js`:

```text
┌────────────────────────────────────────────────────────┐
│  CYBER SECURITY BLUE SYSTEM                            │
│                                                        │
│  [#0B192C] Deep Cyber Navy (Brand Hero / Ink / Dark)   │
│  [#2563EB] Cyber Security Blue (Primary / Vibrant)     │
│  [#1D4ED8] Deep Blue Active / Hover                    │
│  [#DBEAFE] Subtle Blue Border / Accent Tint            │
│  [#F0F6FD] Surface Ice Blue / Container                │
│  [#F8FAFC] Background Slate-50 / Clean Canvas          │
│  [#FFFFFF] Pure White Cards & Input Panels             │
└────────────────────────────────────────────────────────┘
```

### 2.1 Tailwind Token Mapping

| Token Tailwind | Kode Hex | Peran & Penggunaan |
|---|---|---|
| `brand-indigo-hero` / `brand-blue-hero` | `#0B192C` | Deep Cyber Navy: Judul utama, footer, kartu callout solid, modal backdrop |
| `primary` / `brand-blue-vibrant` | `#2563EB` | Cyber Security Blue: Tombol primer, ikon aksen, ring focus aktif |
| `primary-container` / `brand-blue-hover` | `#1D4ED8` | State hover tombol primer, tautan interaktif aktif, header aksen |
| `surface` / `background` | `#F8FAFC` | Latar belakang kanvas aplikasi yang bersih dan tenang |
| `surface-container` | `#F0F6FD` | Kontainer pill switcher, card metadata, badge latar sekunder |
| `surface-container-high` | `#EBF3FC` | Badge pemindai, highlight baris audit aktif |
| `surface-bright` | `#FFFFFF` | Latar belakang kartu standar, konsol input, dan modal dialog |
| `border-subtle` | `#E2E8F0` | Garis batas struktural kartu, divider, dan pemisah kolom |
| `border-blue-subtle` / `border-purple-subtle` | `#DBEAFE` | Garis batas bernuansa biru es untuk kartu interaktif dan hover |
| `on-surface` / `on-background` | `#0F172A` | Teks utama dengan kontras tinggi (WCAG AAA compliant) |
| `on-surface-variant` | `#475569` | Teks keterangan sekunder, timestamp, label kolom, dan catatan kaki |
| `inverse-surface` | `#0B192C` | Latar belakang komponen inversi dan banner darurat tingkat lanjut |

### 2.2 Functional Risk Color System (Isolated Context Only)

Warna risiko diterapkan secara terlokalisir untuk memberikan indikasi bahaya yang tegas tanpa menimbulkan kepanikan berlebih:

* **SAFE / LOW (0–30%)**:
  * Text: `#0F9D58` (Hijau Emerald)
  * Background: `#E6F4EA`
  * Border: `#CEEAD6`
* **CAUTION / MEDIUM (31–60%)**:
  * Text: `#B45309` / `#92400E` (Kuning Amber Tegas)
  * Background: `#FEF3C7`
  * Border: `#FDE68A`
* **HIGH RISK (61–74%)**:
  * Text: `#C2410C` (Oranye Waspada)
  * Background: `#FFEDD5`
  * Border: `#FED7AA`
* **CRITICAL / SCAM (75–100%)**:
  * Text: `#E52534` / `#DC2626` (Merah Bahaya)
  * Background: `#FEECEE`
  * Border: `#FECDD3`

---

## 3. Tipografi & Skala Hirarki

Menggunakan kombinasi **Plus Jakarta Sans** untuk antarmuka teks umum dan **JetBrains Mono** untuk representasi data teknis (URL, Domain, Port, Hash Kriptografis, Case ID).

| Skala | Ukuran Font | Weight | Line Height | Penerapan |
|---|---|---|---|---|
| **Risk Score Dominant** | `56px – 72px` | 800 (Extrabold) | 1.0 | Angka skor risiko utama di ResultPage |
| **Headline XL** | `32px – 48px` | 800 (Extrabold) | 1.15 | Judul hero halaman beranda |
| **Headline LG** | `24px – 30px` | 700 (Bold) | 1.25 | Judul sesi, modal dialog, header halaman riwayat |
| **Title MD** | `18px – 20px` | 700 (Bold) | 1.35 | Judul kartu analisis bukti dan tahapan wawancara |
| **Body Standard** | `14px – 16px` | 500 / 600 | 1.55 | Teks penjelasan indikator, rekomendasi mitigasi |
| **Body Small** | `12px – 13px` | 500 (Medium) | 1.45 | Metadata, timestamp, status badge |
| **Monospace Code** | `12px – 14px` | 600 (Semibold) | 1.40 | URL, DNS hostname, Case ID (`SG-2026...`), Hash |

### 3.1 Dynamic Font Scaling (Senior Accessibility)
Aplikasi mendukung 3 preset penskalaan teks yang disimpan pada preferensi lokal:
* `100% (Standar)`: Pengguna umum laptop / ponsel.
* `125% (Besar)`: Mempermudah pembacaan teks panjang bagi orang tua.
* `150% (Ekstra Besar)`: Target lansia untuk memastikan seluruh indikator terbaca jelas tanpa kacamata.

---

## 4. Struktur Tata Letak (*Layout & Viewport Discipline*)

```text
┌────────────────────────────────────────────────────────┐
│ Fixed Header (h-20 = 80px) [#FFFFFF]                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│ HERO INTAKE CONSOLE (min-h-[calc(100vh - 5rem)])       │
│                                                        │
│  [Emblem Shield + Scan Indicator]                      │
│  "Apakah ini penipuan? Cek keamanannya sekarang."      │
│  [GRATIS. TANPA PERLU DAFTAR.]                         │
│                                                        │
│  [ Mode Tab: Link (URL)  |  Screenshot / Media ]       │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ [Input Bar URL]            [ Periksa Tautan -> ] │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
═════════════════════ LIPATAN LAYAR (FOLD) ═════════════════
┌────────────────────────────────────────────────────────┐
│ Feature Grid Bento Section (bg-surface-bright py-16)   │
│                                                        │
│  [Kartu Fitur 1]     [Kartu Fitur 2]    [Kartu Fitur 3]│
└────────────────────────────────────────────────────────┘
```

1. **Header Fixed (Sticky h-20)**: Berlatar belakang `#FFFFFF` dengan `backdrop-blur` dan garis batas bawah `border-b border-border-subtle`. Berisi logo solid, navigasi utama, pengubah ukuran teks instan, tombol pintas `/riwayat`, dan tombol cepat panggilan darurat.
2. **First Viewport Immersion**: Konsol masukan bukti `#top-input-hero` memiliki tinggi minimal `calc(100vh - 5rem)` vertikal terpusat, membebaskan pengguna dari distraksi visual sebelum bukti diuji.
3. **Pemisahan Fold yang Rapi**: Fitur pendukung (Modus Terkini, Tata Cara, FAQ, Sertifikasi Keamanan) berada di bawah lipatan layar (*below the fold*) dan hanya diakses saat pengguna menggulir halaman.
4. **Fullscreen Scanner Overlay**: Saat tombol periksa ditekan, footer disembunyikan sementara (`isScanning = true`) agar animasi pemindaian siber memenuhi satu layar penuh tanpa *layout jitter* atau *page jumping*.

---

## 5. Spesifikasi Komponen & Pattern Terbaru

### 5.1 Card Standard (`.sg-card`)
```css
.sg-card {
  background-color: #FFFFFF;
  border-radius: 1rem;
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 20px -2px rgba(11, 25, 44, 0.05);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.sg-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px -4px rgba(11, 25, 44, 0.08);
}
```

### 5.2 Modal "Panduan Khusus Orang Tua & Keluarga" (`TelephoneOperatorModal.svelte`)
Komponen penyelamatan insiden interaktif khusus kelompok rentan yang dapat dipicu manual atau otomatis saat tingkat bahaya tinggi terdeteksi:
* **Ukuran Dialog**: `max-w-2xl w-full` dengan radius sudut `rounded-2xl` (16px).
* **Audio Voice Narration**: Tombol kontrol audio terintegrasi Web Speech API (Indonesian locale) dengan indikator animasi gelombang suara saat narasi aktif.
* **Tahapan Pertanyaan Presisi**:
  * Tahap 1: *"Apakah tautan atau dokumen sempat dibuka?"*
  * Tahap 2: *"Apakah Anda sempat mengetikkan PIN atau kata sandi?"*
  * Tahap 3: *"Apakah kode verifikasi SMS (OTP) diberikan ke orang lain?"*
* **Direct Dial Emergency Hotline Buttons**:
  * Tombol berukuran sentuh besar (tinggi `56px`) menggunakan protokol tautan `tel:`.
  * Kontak Bank: HaloBCA (`1500888`), Contact BRI (`14017`), Mandiri Call (`14000`), BNI Call (`1500046`), CIMB Niaga (`14041`), Permata (`1500111`), BSI (`14040`).
  * Kontak Operator Seluler: Telkomsel (`188`), Indosat (`185`), XL Axiata (`817`).
  * Kepolisian Siber: Call Center Polri (`110`).

### 5.3 Dynamic Risk Assistance Trigger
* Jika hasil analisis menghasilkan **Content Risk ≥ 70%** atau **User Exposure ≥ 70%**, modal bantuan keluarga otomatis memberikan notifikasi bantuan adaptif setelah 5 detik atau langsung saat skor bahaya dikonfirmasi.
* Mengurangi kepanikan korban dengan langsung menyuguhkan tombol darurat pemblokiran rekening.

### 5.4 Halaman Khusus Riwayat Kasus (`/riwayat` - `HistoryPage.svelte`)
Halaman arsip bukti digital (*Evidence Vault UI*) mandiri:
* **Split-Pane Layout**: Kolom kiri menampilkan daftar kronologis kasus dengan filter badge status (*Semua*, *Bahaya*, *Waspada*, *Aman*) dan pencarian instan. Kolom kanan menampilkan rincian audit lengkap kasus terpilih.
* **PII Masking Display**: Bukti teks dan nomor ponsel langsung disamarkan secara visual (`0812-****-1234`) untuk menjamin privasi korban saat layar dilihat bersama orang lain.
* **Case ID Kriptografis**: Ditampilkan dalam format monospace dengan sufiks hex unik (`SCAM-174244-a1b2c3d4`) guna mencegah enumerasi data.
* **Export & Re-Analyze**: Tombol langsung untuk mencetak laporan resmi, menyalin resume, atau memeriksa ulang bukti.

### 5.5 Official Incident Case Report (@media print)
Format dokumen audit resmi untuk lampiran laporan bank atau kepolisian:
* Otomatis mengisolasi area laporan cetak saat dialog `window.print()` dipanggil.
* Dilengkapi stempel audit digital, waktu verifikasi ISO 8601, checksum bukti, dan kolom tanda tangan resmi pelapor & investigator.

---

## 6. Aksesibilitas & Standar Inklusivitas

1. **Kepatuhan WCAG 2.1 AAA**: Kontras rasio teks `#0F172A` di atas latar `#F8FAFC` mencapai 14.8:1 (melampaui batas minimum 7:1).
2. **Keyboard Focus States**: Semua elemen input, tautan, dan tombol memiliki outline cincin fokus yang tegas (`focus:ring-2 focus:ring-primary focus:ring-offset-2`).
3. **Prefers-Reduced-Motion**: Seluruh animasi scanner, modal fade, dan card hover otomatis dinonaktifkan ketika preferensi sistem operasi pengguna mengaktifkan pengurangan gerakan.
4. **WhatsApp Family Sync**: Tombol satu-sentuhan dengan pesan terstruktur otomatis: *"Halo, saya baru saja memeriksa pesan mencurigakan di ScamGuard AI dengan skor risiko [X]%. Mohon bantu cek rekening dan jangan transfer dulu."*

---

## 7. Riwayat Perubahan (*Changelog*)

* **v2.2.0 (September 2026 - IDwebhost HackFest Final Release)**:
  * Peluncuran halaman arsip mandiri `/riwayat` (*Dedicated Evidence Vault UI*) dengan tata letak split-pane, filter status, dan pencarian cepat.
  * Redesain komprehensif modal *"Panduan Khusus Orang Tua & Keluarga"* (`TelephoneOperatorModal.svelte`) dengan direct-dial hotline bank & operator seluler, audio TTS Indonesia berkecepatan 0.90x, dan target sentuh 56px+.
  * Implementasi pemicu dinamis bantuan keluarga (*Dynamic Assistance Popup*) berbasis threshold risiko ≥ 70%.
  * Optimasi viewport scanner pemindaian (menyembunyikan footer saat loading) guna mencegah pergeseran tata letak (*layout shift*).
  * Pembaruan total test suite backend menjadi 17 test suites (84 assertions 100% pass).
* **v2.1.0 (September 2026)**:
  * Migrasi tuntas ke palet **Solid Cyber Security Blue** (`#0B192C`, `#2563EB`, `#1D4ED8`).
  * Implementasi aturan mutlak **Zero Gradients** dan **Zero Emojis**.
  * Pengaturan **Above-the-Fold Viewport Strict Hero**: konsol masukan bukti 100% tinggi layar pertama.
* **v2.0.0 (September 2026)**:
  * Scaffolding ulang frontend Svelte 5 Runes + Vite + Tailwind CSS + Bun runtime.
* **v1.0.0 (September 2026)**:
  * Desain konseptual awal Trustworthy Security Intelligence.
