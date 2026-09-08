# Getting Session Desk onto your Mac

## Step 1 — Create the GitHub repo (one time, ~30 seconds)

1. Open: **https://github.com/new?name=session-desk&description=Local-first+therapist+client+and+session+tracker**
2. Owner: **john-prad25**
3. Repository name: **session-desk**
4. Set to **Public**
5. Leave **README**, **.gitignore**, and **license** unchecked (empty repo)
6. Click **Create repository**

## Step 2 — Push from cloud (or your Mac)

After the empty repo exists, run **on your Mac** (if you have GitHub CLI):

```bash
git clone https://github.com/john-prad25/Ash-tracking-app.git
cd Ash-tracking-app
git checkout cursor/therapist-tracker-prototype-0ede
cd therapist-tracker
chmod +x publish-to-github.sh start.sh "Start Session Desk.command"
./publish-to-github.sh
```

That script creates `john-prad25/session-desk` (if needed) and pushes the code.

**Or** reply in Cursor that the repo is created — the agent can push from the cloud environment.

## Step 3 — Clone and run on your Mac

```bash
git clone https://github.com/john-prad25/session-desk.git
cd session-desk
npm install
npm run dev
```

Open **http://127.0.0.1:5173** in Chrome or Safari.

**Easier:** double-click **`Start Session Desk.command`** in Finder after cloning.

## Requirements

- **Node.js 22+** — install from https://nodejs.org if needed
- **Chrome or Safari** — for voice transcription
