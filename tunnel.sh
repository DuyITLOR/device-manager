#!/bin/bash
# tunnel.sh - Khởi động Cloudflare Tunnels và rebuild web với API URL mới

set -e

LOG_API=/tmp/cf-api.log
LOG_WEB=/tmp/cf-web.log

cleanup() {
  echo ""
  echo "Đang tắt tunnels..."
  kill $PID_API $PID_WEB 2>/dev/null
  rm -f $LOG_API $LOG_WEB
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── 1. Khởi động API tunnel (port 5050) ──────────────────────────────────────
echo "▶ Khởi động API tunnel (port 5050)..."
cloudflared tunnel --url http://localhost:5050 > $LOG_API 2>&1 &
PID_API=$!

# Chờ URL xuất hiện trong log (tối đa 30s)
echo "⏳ Đang chờ API tunnel URL..."
for i in $(seq 1 30); do
  API_URL=$(grep -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' $LOG_API 2>/dev/null | head -1)
  if [ -n "$API_URL" ]; then
    break
  fi
  sleep 1
done

if [ -z "$API_URL" ]; then
  echo "❌ Không lấy được API tunnel URL. Kiểm tra log: $LOG_API"
  kill $PID_API 2>/dev/null
  exit 1
fi

echo "✅ API URL: $API_URL"

# ── 2. Rebuild web với API URL mới ───────────────────────────────────────────
echo ""
echo "🔨 Rebuilding web container với NEXT_PUBLIC_API_URL=$API_URL ..."
cd "$(dirname "$0")"
NEXT_PUBLIC_API_URL=$API_URL docker compose up --build -d web
echo "✅ Web container đã được rebuild và khởi động."

# ── 3. Khởi động Web tunnel (port 4000) ──────────────────────────────────────
echo ""
echo "▶ Khởi động Web tunnel (port 4000)..."
cloudflared tunnel --url http://localhost:4000 > $LOG_WEB 2>&1 &
PID_WEB=$!

echo "⏳ Đang chờ Web tunnel URL..."
for i in $(seq 1 30); do
  WEB_URL=$(grep -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' $LOG_WEB 2>/dev/null | head -1)
  if [ -n "$WEB_URL" ]; then
    break
  fi
  sleep 1
done

if [ -z "$WEB_URL" ]; then
  echo "❌ Không lấy được Web tunnel URL. Kiểm tra log: $LOG_WEB"
  kill $PID_WEB 2>/dev/null
  exit 1
fi

# ── 4. In kết quả ─────────────────────────────────────────────────────────────
echo ""
echo "========================================"
echo "🌐 Web:  $WEB_URL"
echo "🔌 API:  $API_URL"
echo "========================================"
echo ""
echo "Nhấn Ctrl+C để tắt tunnels."

# Giữ script chạy
wait $PID_API $PID_WEB
