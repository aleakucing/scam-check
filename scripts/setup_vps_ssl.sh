#!/usr/bin/env bash
# ==============================================================================
# ScamGuard AI — VPS SSL & Production Deployment Script
# IDwebhost AI HackFest 2026 | Cyber Security & Anti Scam
# ==============================================================================
set -e

echo "=================================================================="
echo "    SCAMGUARD AI — AUTOMATED PRODUCTION & SSL SETUP FOR VPS       "
echo "=================================================================="

# Check root / sudo privileges
if [ "$EUID" -ne 0 ]; then
  echo "[!] Script ini memerlukan hak akses root/sudo. Silakan jalankan: sudo bash $0"
  exit 1
fi

# Input Domain & Email
if [ -z "$1" ]; then
  read -p "Masukkan nama domain/subdomain VPS (contoh: scamguard.domainanda.com): " DOMAIN
else
  DOMAIN=$1
fi

if [ -z "$DOMAIN" ]; then
  echo "[ERROR] Domain tidak boleh kosong!"
  exit 1
fi

if [ -z "$2" ]; then
  read -p "Masukkan alamat email untuk sertifikat SSL Let's Encrypt: " EMAIL
else
  EMAIL=$2
fi

if [ -z "$EMAIL" ]; then
  echo "[ERROR] Email tidak boleh kosong!"
  exit 1
fi

echo ""
echo "[1/6] Memeriksa & Menginstal Paket Dependensi (Certbot, Docker, Curl)..."
apt-get update -y
apt-get install -y certbot curl

# Verify Docker is installed
if ! command -v docker &> /dev/null; then
    echo "[!] Docker belum terpasang. Memasang Docker CE..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

echo "[2/6] Memastikan file .env tersedia..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "[INFO] File .env berhasil disalin dari .env.example."
        echo "[PENTING] Jangan lupa untuk mengisi GEMINI_API_KEY di file .env!"
    else
        touch .env
        echo "PORT=8000" >> .env
        echo "HOST=0.0.0.0" >> .env
        echo "GEMINI_MODEL=gemini-1.5-flash" >> .env
        echo "GEMINI_API_KEY=" >> .env
    fi
fi

echo "[3/6] Menghentikan kontainer yang berjalan sementara untuk membebaskan port 80..."
docker compose down 2>/dev/null || true
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

echo "[4/6] Mengajukan Sertifikat SSL Let's Encrypt untuk: $DOMAIN ..."
certbot certonly --standalone \
  -d "$DOMAIN" \
  --agree-tos \
  --email "$EMAIL" \
  --non-interactive

# Verify certificates were created
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "[ERROR] Gagal memperoleh sertifikat SSL untuk $DOMAIN."
    exit 1
fi

echo "[5/6] Mengonfigurasi Nginx Production dengan Domain Anda..."
# Replace placeholder 'domain' in nginx/production.conf with real domain
sed -i "s|/etc/letsencrypt/live/domain/|/etc/letsencrypt/live/$DOMAIN/|g" nginx/production.conf
sed -i "s|server_name _;|server_name $DOMAIN;|g" nginx/production.conf

echo "[6/6] Menjalankan ScamGuard AI dengan Docker Compose Production..."
docker compose -f docker-compose.prod.yml up -d --build

# Set up auto-renewal cronjob
RENEW_CRON="0 3 * * * certbot renew --quiet && docker compose -f $(pwd)/docker-compose.prod.yml restart frontend"
(crontab -l 2>/dev/null | grep -v "certbot renew" ; echo "$RENEW_CRON") | crontab -

echo ""
echo "=================================================================="
echo " [SUCCESS] SCAMGUARD AI PRODUCTION DEPLOYMENT SELESAI!            "
echo "=================================================================="
echo " Aplikasi dapat diakses dengan aman di:"
echo " 🌐 https://$DOMAIN"
echo " 📚 https://$DOMAIN/docs (Swagger API Documentation)"
echo " 🛡️  Status SSL: HTTPS Aktif (Let's Encrypt)"
echo " 🎙️  Fitur Suara (Web Speech API): Aktif & Diizinkan Browser"
echo "=================================================================="
