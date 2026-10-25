# Deploy Gratis Tanpa VPS — Render + Supabase

Panduan ini membuat KrosCheck online **tanpa VPS, tanpa kartu kredit, dan tanpa biaya**.
Frontend dan backend tetap kode yang sama; yang berubah hanya cara penyajian dan
lapisan database.

## Arsitektur

```text
Pengunjung
   │
   ├── https://app.domain.com  ──►  Render Static Site (Svelte + Vite, CDN gratis)
   │
   └── https://api.domain.com  ──►  Render Web Service (Docker, Bun + Hono, free)
                                         │
                                         ├── Supabase Postgres (DATABASE_URL)
                                         └── Gemini API (opsional, fallback heuristik)
```

| Komponen | Layanan | Biaya | Batas free tier |
|---|---|---|---|
| Frontend | Render Static Site | Rp0 | 5 GB bandwidth/bulan (workspace) |
| Backend | Render Web Service (Docker, free) | Rp0 | 512 MB RAM, 0.1 CPU, 750 jam/bulan |
| Database | Supabase Postgres (yang sudah ada) | Rp0 | 500 MB, pause setelah 7 hari tanpa aktivitas |
| Keep-alive | UptimeRobot | Rp0 | monitor tiap 5 menit |
| AI | Gemini API (opsional) | Rp0 | kuota free tier; tanpa key tetap jalan |

> **Penting:** Render free service tidur setelah 15 menit tanpa request dan butuh
> ±1 menit untuk bangun. UptimeRobot di Langkah 5 mencegahnya, sekaligus mencegah
> Supabase di-pause karena tidak ada aktivitas.

---

## Yang perlu disiapkan

- Repository GitHub yang berisi kode ini (sudah ada: `aleakucing/scam-check`).
- Akun [Render](https://dashboard.render.com/register) — gratis, tanpa kartu.
- Project [Supabase](https://supabase.com/dashboard) yang sudah kamu punya.
- Akun [UptimeRobot](https://uptimerobot.com/) — gratis, tanpa kartu.
- Domain yang sudah kamu punya.

---

## Langkah 1 — Ambil connection string Supabase

1. Buka project Supabase. Kalau statusnya **Paused**, klik **Resume project** dulu.
2. Masuk ke **Project Settings → Database → Connection string → URI**.
3. Pilih mode **Pooler / Transaction** (port `6543`), bukan direct connection.
   Contoh bentuknya:

   ```text
   postgresql://postgres.abcdefgh:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

4. Ganti `[YOUR-PASSWORD]` dengan password database project kamu.
   Kalau password mengandung karakter khusus (`@`, `#`, `%`, `:`), URL-encode dulu.
5. Simpan string ini. Jangan di-commit ke Git.

Tabel `cases` dibuat otomatis oleh backend saat pertama kali start. Kamu tidak
perlu menjalankan SQL manual.

---

## Langkah 2 — Deploy lewat Render Blueprint

1. Buka [Render Dashboard](https://dashboard.render.com) → **New → Blueprint**.
2. Hubungkan akun GitHub dan pilih repository `scam-check`.
3. Render akan membaca file `render.yaml` di root repo. Kamu akan diminta mengisi:
   - **DATABASE_URL** → tempel connection string Supabase dari Langkah 1.
   - **VITE_API_BASE_URL** → isi sementara dengan URL API yang akan dibuat,
     misalnya `https://kroscheck-api.onrender.com`. Kalau nama service berubah,
     perbaiki di Langkah 3.
4. Klik **Apply / Create services** dan tunggu kedua service selesai deploy.
   Build pertama bisa 3–8 menit.

Setelah selesai, catat dua URL yang diberikan Render:

- API: `https://kroscheck-api.onrender.com`
- Web: `https://kroscheck-web.onrender.com`

---

## Langkah 3 — Samakan URL API di frontend

Kalau URL API yang diberikan Render berbeda dari yang kamu isi di Langkah 2:

1. Buka service **kroscheck-web** → **Environment**.
2. Ubah `VITE_API_BASE_URL` menjadi URL API yang benar (tanpa garis miring di akhir).
3. Klik **Save Changes**, lalu **Manual Deploy → Deploy latest commit**.
   Variabel `VITE_*` ditempel saat build, jadi frontend harus di-rebuild.

Cek cepat: buka web, lalu DevTools → Network. Request analisis harus menuju
`https://kroscheck-api.onrender.com/api/...`, bukan ke domain web.

---

## Langkah 4 — Pasang domain sendiri

Di Render, buka masing-masing service → **Settings → Custom Domains → Add Custom Domain**.

| Service | Domain | DNS yang dibuat di registrar |
|---|---|---|
| kroscheck-web | `app.domainkamu.com` (atau `www`) | `CNAME app → kroscheck-web.onrender.com` |
| kroscheck-api | `api.domainkamu.com` | `CNAME api → kroscheck-api.onrender.com` |

- Render otomatis menerbitkan sertifikat TLS setelah DNS mengarah ke sana.
- Kalau domain memakai Cloudflare DNS, set record ke **DNS only** (awan abu-abu)
  saat verifikasi awal. Setelah aktif, boleh di-proxy dengan mode **Full (strict)**.
- Setelah domain API aktif, ubah `VITE_API_BASE_URL` menjadi
  `https://api.domainkamu.com`, lalu redeploy static site.
- Tambahkan domain tersebut juga di Supabase? Tidak perlu — Supabase diakses
  dari server, bukan dari browser, dan connection string-nya tidak pernah
  dikirim ke frontend.

---

## Langkah 5 — Cegah tidur dan Supabase pause (wajib)

1. Buat akun [UptimeRobot](https://uptimerobot.com/) (free, tanpa kartu).
2. **Add New Monitor**:
   - Type: **HTTP(s)**
   - Name: `KrosCheck API`
   - URL: `https://api.domainkamu.com/api/health`
   - Interval: **5 minutes**
3. Simpan.

Health check ini melakukan `SELECT 1` ke Postgres, jadi satu monitor menjaga dua
hal sekaligus:

- Render tidak tidur karena selalu ada request masuk.
- Supabase tidak dianggap tidak aktif, sehingga tidak di-pause setelah 7 hari.

Kalau UptimeRobot tidak dipakai, aplikasi tetap jalan, tetapi request pertama
setelah 15 menit idle akan menunggu ±1 menit (cold start), dan Supabase bisa
pause setelah 7 hari tanpa aktivitas.

---

## Opsional — aktifkan Gemini

Tanpa API key, aplikasi tetap berjalan memakai **heuristik bawaan**. Kalau ingin
analisis AI:

1. Render → service **kroscheck-api** → **Environment**.
2. Tambahkan:
   - `GEMINI_API_KEY` = API key dari Google AI Studio.
   - (Opsional) `GEMINI_MODEL` = model yang tersedia untuk key kamu.
3. **Save Changes** → **Manual Deploy → Deploy latest commit**.
4. Cek `https://api.domainkamu.com/api/health`; `ai_key_configured` harus `true`.

Kalau kuota Gemini habis atau model tidak valid, backend otomatis kembali ke
heuristik — situs tidak ikut mati.

---

## Langkah 6 — Verifikasi

Jalankan dari komputer mana pun:

```bash
curl https://api.domainkamu.com/api/health
```

Yang harus terlihat:

```json
{
  "status": "healthy",
  "database": "postgres",
  "database_ok": true,
  "ai_engine": "Built-in Heuristic Safety Engine"
}
```

Lalu di browser:

1. Buka `https://app.domainkamu.com`.
2. Uji salah satu contoh (mis. URL phishing).
3. Pastikan hasil muncul dan tombol buka kasus/laporan bekerja.
4. Buka link kasus (`/hasil/...`) di tab baru — harus bisa dibuka dengan kode akses.
5. Cek **Render → Logs** kalau ada error.

Kalau `database_ok` bernilai `false`, lihat bagian Troubleshooting.

---

## Batas free tier dan risikonya

| Hal | Kenyataan |
|---|---|
| Render tidur | Setelah 15 menit tanpa request; UptimeRobot mencegahnya |
| Render 750 jam/bulan | Selalu menyala ±744 jam/bulan; masih di bawah batas |
| Render 5 GB bandwidth | Cukup untuk demo; upload gambar masuk, bukan keluar |
| Render 0.1 CPU / 512 MB | Cukup untuk Bun + Hono; analisis Gemini berjalan di sisi API, bukan CPU lokal |
| Supabase 500 MB | Data kasus hanya teks; sangat jauh dari batas |
| Supabase pause | Dicegah oleh health check tiap 5 menit |
| Gemini free tier | Opsional; tanpa key aplikasi tetap jalan dengan heuristik |
| Kartu kredit | Tidak diperlukan di Render, Supabase, UptimeRobot |

---

## Troubleshooting

**`database_ok: false` / health 500**
- Pastikan `DATABASE_URL` memakai **pooler** (port `6543`), bukan direct (`5432`).
- Pastikan password benar dan sudah di-URL-encode.
- Buka Supabase → pastikan project tidak **Paused**.
- Cek log Render: error `password authentication failed` berarti password salah;
  `ENOTFOUND` berarti host pooler salah; `SSL required` berarti `sslmode` hilang.

**Frontend memanggil `localhost:8000` atau domain web sendiri**
- `VITE_API_BASE_URL` belum di-set saat build. Set di service static, lalu redeploy.
- Variabel `VITE_*` tidak bisa diubah setelah build tanpa redeploy.

**CORS error**
- Backend mengizinkan `origin: "*"`. Kalau masih gagal, pastikan request menuju
  URL API yang benar dan bukan domain web.

**Kasus tidak ditemukan**
- Link kasus wajib menyertakan `?k=<access_key>`. Kode ini hanya muncul sekali
  di response analisis dan tidak bisa ditebak.

**Render cold start**
- Pasang UptimeRobot. Kalau tetap tidur, cek monitor sedang aktif dan tidak
  kena rate limit.

**Supabase project ter-pause**
- Resume manual di dashboard, lalu tunggu health check berikutnya.

---

## Kalau nanti mau pindah ke VPS lagi

Kode ini tetap mendukung SQLite lokal dan Docker Compose yang lama:

```bash
# tanpa DATABASE_URL, backend memakai SQLite di backend/data/
docker compose up -d --build
```

Dengan `DATABASE_URL` di-set, backend otomatis memakai Postgres — baik di VPS,
Render, maupun platform lain. Tidak ada lock-in.

---

## Alternatif database: Neon

Kalau Supabase tidak bisa dipakai, buat project gratis di [Neon](https://neon.tech)
lalu ganti `DATABASE_URL` dengan connection string **pooled** dari Neon
(hostname mengandung `-pooler`). Tidak ada perubahan kode. Neon juga
auto-suspend saat idle, tetapi bangun otomatis dalam hitungan detik dan tidak
pause permanen seperti Supabase.

---

## Keamanan

- Jangan pernah commit `.env` atau connection string ke Git.
- Simpan `DATABASE_URL` dan `GEMINI_API_KEY` hanya di **Render → Environment**.
- Kalau connection string bocor, ganti password database di Supabase.
- Aplikasi sudah memask PII sebelum menyimpan bukti ke database.
- Tabel `cases` dibuat dengan **Row Level Security (RLS) aktif**, sehingga tidak
  bisa dibaca lewat Supabase REST API memakai anon key. Backend tetap bisa
  mengaksesnya karena memakai role pemilik tabel.
