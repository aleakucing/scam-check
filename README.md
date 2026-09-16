# ScamGuard AI 🛡️
> **AI Agent untuk Risk Assessment, Investigasi Interaktif, dan Respons Penipuan Digital**  
> *Target: IDwebhost AI HackFest 2026 &bull; Kategori: Cyber Security & Anti Scam*

---

## 🌟 Fitur Utama
1. **Multimodal Evidence Intake**: Mendukung analisis tautan (URL), teks percakapan (WhatsApp/SMS/Email), screenshot tangkapan layar, dan transkrip suara.
2. **Triple Dimension Scoring**:
   - **Content Risk (0–100%)**: Seberapa banyak indikator bahaya teknis ditemukan pada konten.
   - **Confidence Score (0–100%)**: Kekuatan dan kelengkapan bukti digital yang dianalisis.
   - **User Exposure (0–100%)**: Seberapa jauh akun dan privasi pengguna telah terpapar.
3. **Adaptive Interview Engine**: Wawancara bertingkat untuk mendeteksi tindakan yang telah dilakukan pengguna (*klik link, input kredensial, penyerahan OTP*).
4. **Dynamic Emergency Mitigation**: Panduan penyelamatan darurat instan jika terdeteksi pengambilalihan akun (Account Takeover).
5. **Official Case Report**: Pembuatan resume dokumen insiden resmi yang siap dicetak dan dilampirkan untuk pengaduan ke pihak berwajib atau perbankan.

---

## 🏗️ Arsitektur & Tech Stack
- **Frontend**: Single Page Application berstandar Apple Aesthetics (Tailwind CSS, Web Speech API, Vanilla JS).
- **Backend API**: Python FastAPI + Pydantic (Asynchronous REST API).
- **AI Engine**: Google Gemini Multimodal API + Built-in Indonesian Cybersecurity Heuristic Rules Engine (Fallback).
- **Reverse Proxy**: Nginx (Gzip, CORS, Security headers).
- **Containerization**: Docker & Docker Compose.
- **Infrastruktur**: IDwebhost Cloud VPS (Ubuntu 24.04 LTS).

---

## 🚀 Panduan Deployment Cepat di VPS IDwebhost

### 1. Masuk ke VPS via SSH
```bash
ssh -p 4422 root@103.30.146.185
```

### 2. Clone Repository
```bash
git clone https://github.com/aleakucing/scam-check.git ~/scamguard
cd ~/scamguard
```

### 3. Konfigurasi Environment (Opsional)
Salin template konfigurasi:
```bash
cp .env.example .env
```
*(Opsional: Masukkan `GEMINI_API_KEY` Anda ke dalam `.env` menggunakan `nano .env`. Jika dikosongkan, ScamGuard otomatis berjalan menggunakan mesin heuristik bawaan).*

### 4. Jalankan Aplikasi dengan Docker Compose
```bash
docker compose up -d --build
```

Setelah selesai, buka browser Anda di:
👉 **`http://103.30.146.185`**

Dokumentasi API Swagger interaktif:
👉 **`http://103.30.146.185/docs`**

---

## 💻 Menjalankan Secara Lokal (Development)

### Menjalankan Backend:
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Buka `frontend/index.html` langsung di browser Anda atau gunakan live server.
