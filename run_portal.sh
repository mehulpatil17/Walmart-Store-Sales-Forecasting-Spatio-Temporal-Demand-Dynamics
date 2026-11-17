#!/usr/bin/env bash
# ==============================================================================
# Cross-Platform Launcher: Walmart ML Research Portal (Linux & macOS)
# Course: ES 335 - Machine Learning | IIT Gandhinagar
# Authors: Mehul Patil (25110200) & Akshit Kumar (25110022)
# ==============================================================================

set -e

echo "======================================================================"
echo "Launching Walmart ML Research Portal with Model (ES 335 - IITGN)"
echo "======================================================================"

# 1. Resolve Project Root Directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 2. Detect Python Binary (Virtual environment preferred)
PY_CMD=""
if [ -f "$SCRIPT_DIR/venv/bin/python" ]; then
    PY_CMD="$SCRIPT_DIR/venv/bin/python"
    echo "[OK] Found virtual environment Python: venv/bin/python"
elif command -v python3 &>/dev/null; then
    PY_CMD="python3"
    echo "[OK] Using system python3: $(command -v python3)"
elif command -v python &>/dev/null; then
    PY_CMD="python"
    echo "[OK] Using system python: $(command -v python)"
else
    echo "[ERROR] Python 3 not found. Please install Python 3.10+."
    exit 1
fi

# 3. Detect Node.js & npm
if ! command -v npm &>/dev/null; then
    echo "[ERROR] npm not found. Please install Node.js 18+ (https://nodejs.org/)."
    exit 1
fi
echo "[OK] Node.js $(node -v) and npm $(npm -v) detected."

# 4. Launch XGBoost Model Server (Background on port 5001)
echo "Starting XGBoost Model Server on http://127.0.0.1:5001..."
$PY_CMD model_server.py &
SERVER_PID=$!

# Ensure model server is gracefully terminated when script exits
cleanup() {
    echo ""
    echo "Shutting down Model Server (PID: $SERVER_PID)..."
    kill "$SERVER_PID" 2>/dev/null || true
    echo "Clean shutdown complete."
}
trap cleanup EXIT INT TERM

# Brief pause to verify server initialization
sleep 1
if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "[ERROR] Model server failed to start. Check models/ and dependencies."
    exit 1
fi
echo "[OK] Model server running (PID: $SERVER_PID)."

# 5. Launch Next.js Research Portal (Port 3000)
cd "$SCRIPT_DIR/portal"
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing portal npm dependencies..."
    npm install
fi

echo "Launching Next.js Research Portal on http://localhost:3000..."
if [ -d ".next" ]; then
    npm run start -- -p 3000
else
    npm run dev -- -p 3000
fi
