#!/bin/bash
# ====================================================================
# ScamGuard AI - One-Click VPS Setup Script
# IDwebhost AI HackFest 2026
# ====================================================================

set -e

echo ""
echo "========================================================"
echo "  🛡️  Memulai Pengaturan ScamGuard AI di IDwebhost VPS  "
echo "========================================================"
echo ""

# 1. Pasang Skill ScamGuard ke Hermes Agent (jika Hermes terpasang)
if command -v hermes &> /dev/null; then
    echo "[1/4] Memasang ScamGuard Skill ke Hermes Agent..."
    mkdir -p ~/.hermes/skills/scamguard
    cp ./skills/scamguard/SKILL.md ~/.hermes/skills/scamguard/
    echo "      ✓ Skill berhasil didaftarkan ke ~/.hermes/skills/scamguard/"
else
    echo "[1/4] Hermes Agent tidak terdeteksi di PATH, melewati pendaftaran skill."
fi

# 2. Siapkan file .env jika belum ada
echo "[2/4] Menyiapkan konfigurasi environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "      ✓ File .env berhasil dibuat dari template."
else
    echo "      ✓ File .env sudah ada."
fi

# 3. Jalankan Docker Compose
echo "[3/4] Membangun dan menjalankan container (Backend + Frontend)..."
docker compose up -d --build

# 4. Verifikasi status
echo "[4/4] Memeriksa status service..."
sleep 3
docker compose ps

SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

echo ""
echo "========================================================"
echo "  🎉 DEPLOYMENT SELESAI & BERHASIL BERJALAN AKTIF!     "
echo "========================================================"
echo ""
echo "👉 Akses Web Utama       : http://${SERVER_IP}"
echo "👉 Dokumentasi API (Docs): http://${SERVER_IP}/docs"
echo ""
echo "Untuk menguji Hermes Agent dari terminal:"
echo "  hermes chat -q \"Periksa link ini: https://id-bca-verifikasi.xyz\""
echo ""
echo "========================================================"
