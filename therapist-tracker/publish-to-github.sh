#!/bin/bash
set -euo pipefail

# Run this ONCE on your Mac after creating an empty GitHub repo named "session-desk".
# Usage: ./publish-to-github.sh

REPO_OWNER="john-prad25"
REPO_NAME="session-desk"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required. Install: brew install gh"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Run: gh auth login"
  exit 1
fi

if ! gh repo view "${REPO_OWNER}/${REPO_NAME}" >/dev/null 2>&1; then
  echo "Creating ${REPO_OWNER}/${REPO_NAME} on GitHub..."
  gh repo create "${REPO_OWNER}/${REPO_NAME}" \
    --public \
    --description "Local-first therapist client and session tracking prototype" \
    --source=. \
    --remote=origin \
    --push
else
  echo "Repo exists. Pushing to origin main..."
  git push -u origin main
fi

echo ""
echo "Done! Clone on any Mac with:"
echo "  git clone https://github.com/${REPO_OWNER}/${REPO_NAME}.git"
echo "  cd ${REPO_NAME}"
echo "  npm install"
echo "  npm run dev"
