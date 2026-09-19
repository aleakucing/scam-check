# ScamGuard AI — Design System: Trustworthy Security Intelligence & Solid Cyber Blue

**Version:** 2.1.0  
**Target:** IDwebhost AI HackFest 2026  
**Category:** Digital Safety & Public Good → Cyber Security & Anti Scam  
**Philosophy:** Information-rich, Border-driven, Precise, Solid, and Calm (Zero Gradients, Zero Emojis)

---

## 1. Executive Summary & Core Rules

ScamGuard AI (KrosCheck PRO) menerapkan sistem desain **"Trustworthy Security Intelligence"** yang mengombinasikan ketelitian antarmuka keamanan siber kelas enterprise dengan kemudahan akses bagi seluruh lapisan masyarakat (khususnya orang tua dan lansia).

### Aturan Utama Sistem Desain:
1. **Zero Gradients (Solid Precision)**: Tidak ada efek gradasi warna (`linear-gradient`, `radial-gradient`, atau class Tailwind `bg-gradient-*`) pada teks, kartu, tombol, background aura, maupun scanner bar. Semua elemen menggunakan warna solid dengan batas kontras tajam.
2. **Zero Emojis**: Menggunakan ikon garis presisi teknis (Google Material Symbols / Lucide Icons). Tidak menggunakan emoji informal.
3. **Above-the-Fold Strict Hero**: Bagian konsol input utama berukuran minimal satu layar penuh (`min-h-[calc(100vh-5rem)]`), memastikan pengguna pertama kali langsung fokus pada pemeriksaan tanpa terdistraksi oleh daftar fitur di bawahnya (*below the fold*).
4. **Zero Intake Clutter**: Menghilangkan banner peringatan sekunder atau teks bertele-tele di atas konsol masukan bukti agar alur interaksi tetap bersih dan efisien.

---

## 2. Palet Warna & Semantic Token Mapping

Sistem warna dikonfigurasi secara sentral pada `frontend/tailwind.config.js`:

```text
┌────────────────────────────────────────────────────────┐
│  CYBER SECURITY BLUE SYSTEM                            │
│                                                        │
│  [#0B192C] Deep Cyber Navy (Brand Indigo Hero / Dark)   │
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
| `brand-indigo-hero` | `#0B192C` | Deep Cyber Navy: Judul utama, footer, kartu callout solid, modal backdrop |
| `primary` | `#2563EB` | Cyber Security Blue: Tombol primer, ikon aksen, ring focus |
| `brand-violet-vibrant` | `#2563EB` | Alias aksen biru cerah untuk badge status dan emblem |
| `brand-violet-hover` | `#1D4ED8` | State hover tombol primer dan tautan interaktif |
| `surface` / `background`| `#F8FAFC` | Latar belakang kanvas aplikasi yang bersih |
| `surface-container` | `#F0F6FD` | Kontainer pill mode switcher dan card metadata |
| `surface-container-high`| `#EBF3FC` | Badge pemindai dan indikator sekunder |
| `surface-bright` | `#FFFFFF` | Latar belakang bagian konten dan modal |
| `border-subtle` | `#E2E8F0` | Garis batas struktural kartu dan pemisah konten |
| `border-purple-subtle` | `#DBEAFE` | Garis batas halus bernuansa biru es |
| `on-surface` | `#0F172A` | Teks utama dengan kontras tinggi (WCAG AAA compliant) |
| `on-surface-variant` | `#475569` | Teks keterangan sekunder, timestamp, dan catatan kaki |

### 2.2 Functional Risk Color System (Isolated Context Only)
Warna risiko tidak boleh mewarnai seluruh latar belakang halaman; hanya diterapkan pada indikator spesifik:
* **SAFE / LOW (0–30%)**: `#0F9D58` (Hijau Emerald) / Bg: `#E6F4EA`
* **CAUTION / MEDIUM (31–60%)**: `#F59E0B` (Kuning Amber) / Bg: `#FEF3C7`
* **HIGH RISK (61–79%)**: `#F97316` (Oranye Waspada) / Bg: `#FFEDD5`
* **CRITICAL / SCAM (80–100%)**: `#DC2626` / `#E52534` (Merah Bahaya) / Bg: `#FEECEE`

---

## 3. Tipografi & Skala Hirarki

Menggunakan jenis huruf utama **Plus Jakarta Sans** untuk kenyamanan membaca optimal dan **JetBrains Mono** untuk representasi data teknis (URL, Domain, Hash, Case ID).

| Skala | Ukuran Font | Weight | Line Height | Penerapan |
|---|---|---|---|---|
| **Risk Score Display** | `56px – 72px` | 800 (Extrabold) | 1.0 | Skor risiko dominan di ResultPage |
| **Headline XL** | `32px – 48px` | 800 (Extrabold) | 1.15 | Judul hero halaman beranda |
| **Headline LG** | `24px – 30px` | 700 (Bold) | 1.25 | Judul sesi & modal dialog |
| **Title MD** | `18px – 20px` | 700 (Bold) | 1.35 | Judul kartu analisis bukti |
| **Body Standard** | `14px – 16px` | 500 / 600 | 1.55 | Teks penjelasan indikator |
| **Body Small** | `12px – 13px` | 500 (Medium) | 1.45 | Metadata, label tombol mini |
| **Monospace Code** | `12px – 14px` | 600 (Semibold) | 1.40 | URL, DNS hostname, Case ID |

---

## 4. Struktur Tata Letak (*Layout & Above-the-Fold Rule*)

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
│ Feature Grid Section (bg-surface-bright py-16)         │
│                                                        │
│  [Kartu Fitur 1]     [Kartu Fitur 2]    [Kartu Fitur 3]│
└────────────────────────────────────────────────────────┘
```

1. **Header Fixed**: Selalu berada di posisi `top-0` dengan backdrop blur dan garis batas bawah subtil.
2. **First Viewport Immersion**: Area `#top-input-hero` memiliki tinggi minimal `calc(100vh - 5rem)` dengan `py-16 md:py-24` dan `justify-center` vertikal.
3. **Pemisahan Fold yang Rapi**: Bagian `Feature Grid` hanya muncul ketika pengguna menggulir ke bawah, menjaga fokus 100% pada konsol investigasi saat pertama kali aplikasi dibuka.

---

## 5. Spesifikasi Komponen & Utility Classes (`app.css`)

### 5.1 Card Standard (`.sg-card`)
```css
.sg-card {
  background-color: #FFFFFF;
  border-radius: 1.25rem;
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 20px -2px rgba(11, 25, 44, 0.05);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.sg-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px -4px rgba(11, 25, 44, 0.1);
}
```

### 5.2 Secondary Action Pill (`.sg-btn-secondary`)
```css
.sg-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  color: #0B192C;
  font-weight: 600;
  font-size: 0.8125rem;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.sg-btn-secondary:hover {
  background-color: #EFF6FF;
  border-color: #BFDBFE;
  color: #1D4ED8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12);
}
```

### 5.3 Senior Accessibility Touch Targets
* Tombol interaksi darurat dan pilihan wawancara memiliki tinggi minimal **`44px` hingga `72px`**.
* Dilengkapi umpan balik audio Text-to-Speech (TTS) dan tombol pintas kontak darurat perbankan nasional (HaloBCA `1500888`, Contact BRI `14017`, Mandiri Call `14000`).

---

## 6. Riwayat Perubahan (*Changelog*)

* **v2.1.0 (September 2026)**:
  * Migrasi tuntas ke palet **Solid Cyber Security Blue** (`#0B192C`, `#2563EB`, `#1D4ED8`).
  * Implementasi aturan mutlak **Zero Gradients** (mengeliminasi seluruh background aura blur dan text gradient).
  * Pengaturan **Above-the-Fold Viewport**: konsol input utama berukuran 100% tinggi layar pertama (`min-h-[calc(100vh-5rem)]`).
  * Penghapusan banner disclaimer dan teks penjelasan sekunder untuk memfokuskan atensi pengguna ke tombol input.
* **v2.0.0 (September 2026)**:
  * Scaffolding ulang frontend Svelte 5 Runes + Vite + Tailwind CSS.
  * Implementasi dual-tab input konsol (URL & Screenshot OCR).
* **v1.0.0**:
  * Spesifikasi awal Trustworthy Security Intelligence.
