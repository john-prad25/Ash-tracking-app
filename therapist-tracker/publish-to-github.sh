#!/bin/bash
set -euo pipefail

# Run on your Mac after installing Node.js and GitHub CLI (gh).
# Usage: ./publish-to-github.sh

REPO_OWNER="john-prad25"
REPO_NAME="session-desk"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required. Install: brew install gh"
  echo "Then run: gh auth login"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Run: gh auth login"
  exit 1
fi

if [ ! -d .git ]; then
  echo "Initializing git repository..."
  git init -b main
  git add .
  git commit -m "Initial commit: Session Desk therapist tracker prototype"
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
  if git remote get-url origin >/dev/null 2>&1; then
    git remote set-url origin "https://github.com/${REPO_OWNER}/${REPO_NAME}.git"
  else
    git remote add origin "https://github.com/${REPO_OWNER}/${REPO_NAME}.git"
  fi
  echo "Repo exists. Pushing to origin main..."
  git branch -M main
  git push -u origin main
fi

echo ""
echo "Done! Clone on any Mac with:"
echo "  git clone https://github.com/${REPO_OWNER}/${REPO_NAME}.git"
echo "  cd ${REPO_NAME}"
echo "  npm install"
echo "  npm run dev"
