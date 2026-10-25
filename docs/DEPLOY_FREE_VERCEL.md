# Deploy Gratis Tanpa VPS — Vercel + Supabase (Tanpa Kartu)

Panduan ini membuat KrosCheck online **Rp0, tanpa VPS, dan tanpa kartu kredit**.
Frontend tetap Svelte/Vite, backend tetap Bun + Hono, dan database memakai
project Supabase yang sudah ada. Jalur Bun/Docker untuk VPS **tidak dihapus**;
Vercel hanya menambah entry `server.ts` di root repo.

> **Kenapa bukan Render?** Render Free bisa meminta verifikasi kartu untuk akun
> baru (temporary $1 authorization). Kalau kamu tidak mau memasukkan kartu sama
> sekali, gunakan Vercel. Panduan Render tetap tersedia di
> [DEPLOY_FREE_RENDER.md](DEPLOY_FREE_RENDER.md) untuk akun yang tidak diminta
> kartu atau yang bersedia verifikasi.

## Arsitektur

```text
Pengunjung
   │
   ├── https://app.domain.com  ──►  Vercel Static (Svelte + Vite, CDN gratis)
   │
   └── https://api.domain.com  ──►  Vercel Hono (Node/Fluid Functions)
                                         │
                                         ├── Supabase Postgres (DATABASE_URL)
                                         └── Gemini API (opsional, fallback heuristik)
```

| Komponen | Layanan | Biaya | Catatan free tier |
|---|---|---|---|
| Frontend | Vercel Hobby (static) | Rp0 | CDN, custom domain, tanpa kartu |
| Backend | Vercel Hobby (Hono/Fluid) | Rp0 | 1 juta invocation/bulan, tanpa tidur |
| Database | Supabase Postgres | Rp0 | 500 MB, pause setelah 7 hari tanpa aktivitas |
| Keep-alive | UptimeRobot | Rp0 | monitor `/api/health` tiap 5 menit |
| AI | Gemini API | Rp0 | kuota free; tanpa key tetap jalan heuristik |

Vercel Hobby ditujukan untuk proyek **personal/non-komersial**. Untuk hackathon
ini aman. Kalau nanti produknya komersial, pindah ke Vercel Pro atau VPS.

---

## Yang perlu disiapkan

- Repository GitHub `aleakucing/scam-check` (sudah ada).
- Akun [Vercel](https://vercel.com/signup) — daftar dengan GitHub, **tanpa kartu**.
- Project [Supabase](https://supabase.com/dashboard) yang sudah aktif.
- Domain (opsional; `*.vercel.app` tetap bisa dipakai untuk demo).
- Akun [UptimeRobot](https://uptimerobot.com/) — gratis, tanpa kartu (opsional
  tapi sangat disarankan agar Supabase tidak di-pause).

---

## Langkah 1 — Ambil connection string Supabase (pooler)

1. Buka project Supabase. Kalau statusnya **Paused**, klik **Resume project**.
2. Klik tombol hijau **Connect** (kanan atas) → tab **Connection pooling** /
   **Pooler**.
3. Pilih mode **Transaction** (port `6543`). Jangan pakai direct connection
   `5432` untuk Vercel: direct connection Supabase sering hanya IPv6, sedangkan
   Vercel butuh IPv4.
4. Copy URI-nya. Bentuknya seperti:

   ```text
   postgresql://postgres.kgbsxkazpfrlvxbdhnjf:PASSWORD@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

5. Ganti `[YOUR-PASSWORD]` dengan password database. Kalau password mengandung
   `@`, `#`, `%`, `:`, atau karakter khusus lain, **URL-encode** dulu (mis.
   `@` → `%40`).
6. Simpan string ini. Jangan commit ke Git dan jangan kirim ke chat.

Tabel `cases` dibuat otomatis oleh backend saat request pertama. Kode sudah
memakai `prepare: false` (wajib untuk PgBouncer transaction mode).

---

## Langkah 2 — Deploy project API (backend Hono)

1. Buka [vercel.com/new](https://vercel.com/new) → import repo
   `aleakucing/scam-check`.
2. Isi:
   - **Project Name**: `kroscheck-api`
   - **Root Directory**: `./` (root repo, **bukan** `backend`)
   - **Framework Preset**: `Hono` (biasanya terdeteksi otomatis dari
     `server.ts`)
   - **Build Command / Output Directory**: biarkan default
3. Buka **Environment Variables**, tambahkan:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | URI pooler Supabase dari Langkah 1 |
   | `GEMINI_API_KEY` | API key Gemini (opsional; tanpa ini tetap jalan) |

   Opsional: `GEMINI_MODEL`, `DATABASE_POOL_MAX=5`.

4. Klik **Deploy**. Build pertama biasanya 1–3 menit.
5. Setelah selesai, catat **Production URL** API, misalnya
   `https://kroscheck-api.vercel.app`.
6. Buka `https://kroscheck-api.vercel.app/api/health`. Yang diharapkan:

   ```json
   {
     "status": "healthy",
     "database": "postgres",
     "database_ok": true,
     "case_vault": "postgres"
   }
   ```

   Kalau `database_ok: false`, cek log Vercel dan `DATABASE_URL` (lihat
   Troubleshooting).

> **Penting:** root `server.ts` adalah entry Vercel. Ia mengimpor
> `backend/src/app.ts` dan memasang `pgStore`. Entry Bun/VPS
> `backend/src/index.ts` tidak dipakai Vercel, jadi `bun:sqlite` tidak ikut
> ter-bundle.

---

## Langkah 3 — Deploy project frontend (Svelte/Vite)

1. Di Vercel, **Add New → Project** → import repo yang sama.
2. Isi:
   - **Project Name**: `kroscheck-web`
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm ci --include=dev && npm run build`
   - **Output Directory**: `dist`
3. Buka **Environment Variables**, tambahkan:

   | Name | Value |
   |---|---|
   | `VITE_API_BASE_URL` | URL API dari Langkah 2, tanpa slash di akhir |

   Contoh: `https://kroscheck-api.vercel.app`.

4. Klik **Deploy**, lalu buka URL frontend.
5. Uji alur:
   - Masukkan URL contoh (mis. `https://id-bca-verifikasi-keamanan.xyz/login`).
   - Tunggu hasil analisis.
   - Klik buka laporan; URL harus berbentuk `/hasil/SC-...?k=...`.
   - Coba unggah screenshot besar (>2 MB). Browser otomatis mengompres ke JPEG
     di bawah 4 MB sebelum dikirim.

`VITE_API_BASE_URL` di-inline saat **build**. Kalau URL API berubah, ubah env
lalu **Redeploy** frontend; tanpa redeploy, bundle lama masih memakai URL lama.

---

## Langkah 4 — Custom domain (opsional)

1. **Project API** → Settings → Domains → tambahkan `api.domain.com`.
2. **Project frontend** → Settings → Domains → tambahkan `app.domain.com`.
3. Vercel menampilkan record DNS. Tambahkan di registrar/Cloudflare:
   - `api` → CNAME ke `cname.vercel-dns.com` (atau record yang ditampilkan).
   - `app` → CNAME ke `cname.vercel-dns.com`.
4. Tunggu SSL terbit (biasanya <2 menit).
5. Ubah `VITE_API_BASE_URL` frontend menjadi `https://api.domain.com`, lalu
   **Redeploy** frontend.
6. Kalau domain memakai Cloudflare proxy (orange cloud), paling mudah set
   **DNS only** (grey cloud) untuk record CNAME ke Vercel, atau pindahkan
   nameserver domain ke Vercel. Proxy Cloudflare + Vercel bisa bekerja, tapi
   menambah lapisan yang tidak perlu untuk demo.

Setelah custom domain aktif, API dan frontend tetap **satu origin policy** yang
sama seperti sebelumnya: frontend memanggil `https://api.domain.com/api/*` dan
backend mengizinkan CORS `*`.

---

## Langkah 5 — Keep-alive Supabase

Vercel Functions tidak tidur, tetapi **Supabase Free bisa pause setelah 7 hari
tanpa aktivitas**. Buat monitor agar database tetap hidup:

1. UptimeRobot → **Add New Monitor** → **HTTP(s)**.
2. URL: `https://api.domain.com/api/health` (atau URL `*.vercel.app` API).
3. Interval: **5 minutes**.
4. Simpan.

Endpoint `/api/health` menjalankan `SELECT 1` dan otomatis membuat tabel
`cases` pada request pertama, jadi satu monitor menjaga Vercel + Supabase.

---

## Batas Vercel Hobby yang perlu diketahui

| Batas | Nilai | Dampak ke KrosCheck |
|---|---|---|
| Request body function | 4,5 MB | Frontend mengompres gambar >2 MB ke JPEG max 2000 px; backend menolak base64 >4 MB |
| Response body | 4,5 MB | Di Vercel, TTS memakai Google TTS MP3 (bukan WAV Gemini) dan teks dibatasi 600 karakter |
| Durasi function | s.d. 300 detik | Panggilan Gemini punya timeout 12 detik lalu fallback heuristik; frontend menunggu 20 detik |
| Invocation | ±1 juta/bulan | Cukup untuk demo dan traffic kecil |
| Bandwidth | ±100 GB/bulan | Cukup |
| Lisensi | Personal/non-komersial | Hackathon aman; komersial → Pro/VPS |

TTS tetap punya fallback ke suara browser kalau Google TTS diblokir atau gagal.
Analisis teks/URL/screenshot tidak bergantung pada TTS.

---

## Troubleshooting

### `DATABASE_URL is required when the Postgres driver is selected`
Environment variable belum ada di **project API** (bukan frontend). Tambahkan
di Settings → Environment Variables, lalu **Redeploy**.

### `password authentication failed for user "postgres.xxxx"`
- Pastikan memakai URI **pooler transaction** (host `aws-0-...pooler.supabase.com`,
  port `6543`), bukan direct `db.xxxx.supabase.co:5432`.
- Ganti password dengan benar dan URL-encode karakter khusus.
- Kalau password baru diubah di Supabase, copy ulang connection string.

### `/api/health` → `database_ok: false` / timeout
- Supabase project mungkin **Paused**; resume dulu.
- Cek pooler host dan port 6543.
- Cek Vercel **Functions → Logs** untuk pesan `[KrosCheck] Database health
  check failed`.
- Pastikan `DATABASE_SSL` tidak di-set `disable` di Vercel (default kode:
  `require` untuk host non-local).

### `FUNCTION_INVOCATION_FAILED`
Buka Vercel → project API → **Logs**. Biasanya env belum diset, atau build
memakai root directory yang salah. Root API harus `./` dan entry-nya `server.ts`.
Jangan set root ke `backend`; entry Vercel ada di root.

### Frontend memanggil `/api/...` ke domain frontend (404)
`VITE_API_BASE_URL` belum diisi atau salah. Isi dengan URL API lengkap, lalu
**Redeploy** frontend. Cek juga bahwa API project dan frontend project memakai
repo yang sama.

### Upload gambar → 413 / `Ukuran berkas gambar melebihi batas`
Gambar masih >4 MB setelah kompresi. Kompresi otomatis hanya berjalan untuk file
>2 MB dan memakai JPEG max 2000 px. Coba screenshot yang lebih kecil atau crop
bagian penting. Jangan menaikkan limit backend di Vercel: batas platform 4,5 MB
tetap berlaku.

### Halaman `/hasil/...` 404 setelah refresh
Pastikan project frontend memakai root `frontend` dan file `frontend/vercel.json`
terbaca (berisi rewrite SPA). Redeploy frontend.

### TTS tidak berbunyi
Di Vercel jalur TTS server memakai Google TTS MP3. Kalau Google diblokir/limit,
frontend otomatis memakai suara browser. Cek console browser; ini tidak
mengganggu analisis.

### CORS
Backend memakai `origin: "*"`. Kalau kamu mengubahnya, tambahkan domain frontend
(`https://app.domain.com`) ke allowlist.

---

## Verifikasi cepat setelah deploy

1. `GET https://api.domain.com/api/health` → `database: "postgres"`,
   `database_ok: true`.
2. Analisis URL di frontend → dapat skor + link `/hasil/...`.
3. Buka link `/hasil/...` di tab baru → laporan termuat (artinya kasus tersimpan
   di Supabase dan access key valid).
4. Upload screenshot 5 MB → request `/api/analyze` di DevTools Network harus
   <4,5 MB; hasil muncul.
5. Supabase → Table Editor → `cases` → baris baru muncul. RLS tetap aktif;
   anon/PostgREST tidak bisa membaca tabel, hanya backend (owner) yang bisa.

---

## Kembali ke VPS / Render

Jalur lama tetap utuh:

- **VPS/Docker**: `docker compose up -d --build`, SQLite lokal, tanpa
  `DATABASE_URL`.
- **Render**: `render.yaml` + `backend/Dockerfile`; isi `DATABASE_URL` dan
  `VITE_API_BASE_URL`. Render bisa meminta verifikasi kartu untuk akun baru.
- **Postgres tanpa Vercel**: set `DATABASE_URL` di environment mana pun; backend
  otomatis memakai `pgStore`.

Dokumen Render: [DEPLOY_FREE_RENDER.md](DEPLOY_FREE_RENDER.md).
