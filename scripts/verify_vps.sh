#!/usr/bin/env bash
# ==============================================================================
# ScamGuard AI — VPS Health & Sanity Verification Tool
# IDwebhost AI HackFest 2026 | Cyber Security & Anti Scam
# ==============================================================================

echo "=================================================================="
echo "         SCAMGUARD AI — PEMERIKSAAN KESEHATAN VPS                 "
echo "=================================================================="

# Check Docker status
echo -n "[1] Status Docker Engine: "
if docker info > /dev/null 2>&1; then
    echo "AKTIF (OK)"
else
    echo "TIDAK AKTIF / ERROR"
fi

# Check running containers
echo -n "[2] Kontainer ScamGuard: "
RUNNING=$(docker ps --filter "name=scamguard" --format "{{.Names}} ({{.Status}})")
if [ -n "$RUNNING" ]; then
    echo "BERJALAN"
    echo "$RUNNING" | sed 's/^/    - /'
else
    echo "TIDAK ADA KONTAINER BERJALAN"
fi

# Test Backend API Health internally
echo -n "[3] Endpoint Backend Internal (http://localhost:8000/api/health): "
HEALTH_RESP=$(curl -s -m 5 http://localhost:8000/api/health 2>/dev/null || true)
if [ -n "$HEALTH_RESP" ]; then
    echo "RESPONSIF"
    echo "    $HEALTH_RESP"
else
    # Try through Docker network or Nginx
    NGINX_HEALTH=$(curl -s -m 5 http://localhost/api/health 2>/dev/null || true)
    if [ -n "$NGINX_HEALTH" ]; then
        echo "RESPONSIF VIA NGINX"
        echo "    $NGINX_HEALTH"
    else
        echo "TIDAK TERHUBUNG (Periksa docker logs scamguard-backend-prod)"
    fi
fi

# Check Environment Variables
echo -n "[4] Kunci API AI (GEMINI_API_KEY): "
if [ -f ".env" ]; then
    if grep -q "GEMINI_API_KEY=AI" .env || grep -q "GEMINI_API_KEY=." .env; then
        echo "TERKONFIGURASI DI .env"
    else
        echo "KOSONG / BELUM DIISI (Sistem berjalan dengan Heuristic Engine)"
    fi
else
    echo "FILE .env TIDAK DITEMUKAN"
fi

echo "=================================================================="
