#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install Node 22+ from https://nodejs.org"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies (first run only)..."
  npm install
fi

PORT=5173
if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port $PORT is already in use. Session Desk may already be running."
  echo "Open: http://127.0.0.1:$PORT"
  if command -v open >/dev/null 2>&1; then
    open "http://127.0.0.1:$PORT"
  fi
  exit 0
fi

echo ""
echo "Session Desk — Therapist Tracker"
echo "================================"
echo "Starting at http://127.0.0.1:$PORT"
echo "Press Ctrl+C to stop."
echo ""

if command -v open >/dev/null 2>&1; then
  (sleep 2 && open "http://127.0.0.1:$PORT") &
fi

npm run dev
