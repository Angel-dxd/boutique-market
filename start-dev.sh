#!/bin/bash

# start-dev.sh
# Detects the local IP address and starts both backend and frontend servers

echo "==========================================="
echo "   Starting Market-Boutique Dev Servers    "
echo "==========================================="

# Detect local IP (Works on macOS and most Linux distros)
if command -v ipconfig getifaddr >/dev/null 2>&1; then
    # macOS
    LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
elif command -v ip >/dev/null 2>&1; then
    # Linux (iproute2)
    LOCAL_IP=$(ip route get 1.1.1.1 | grep -oP 'src \K\S+')
elif command -v hostname >/dev/null 2>&1; then
    # Fallback
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

if [ -z "$LOCAL_IP" ]; then
    echo "⚠️ Warning: Could not detect local IP. Falling back to localhost."
    LOCAL_IP="localhost"
else
    echo "✅ Local IP detected: $LOCAL_IP"
fi

export REACT_APP_API_URL="http://$LOCAL_IP:3000/api"
echo "✅ API URL set to: $REACT_APP_API_URL"

echo "-------------------------------------------"
echo "Starting Backend on port 3000..."
cd backend && npm run dev &
BACKEND_PID=$!

echo "-------------------------------------------"
echo "Starting Frontend using dynamic IP logic..."
# The frontend uses window.location.hostname in api.js, so we just run the server.
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo "==========================================="
echo "Servers are running."
echo "Access from mobile devices at: http://$LOCAL_IP:4200"
echo "Press Ctrl+C to stop both servers."
echo "==========================================="

# Wait for background processes to finish (or Ctrl+C)
wait $BACKEND_PID
wait $FRONTEND_PID
