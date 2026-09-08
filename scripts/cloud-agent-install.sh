#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

npm install
npx playwright install chromium

# startup.sh and browser-smoke expect /workspace to be the app root.
ln -sfn "$ROOT" /workspace
