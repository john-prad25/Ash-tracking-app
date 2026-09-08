# Getting Session Desk onto your Mac

The cloud agent **cannot create GitHub repos** on your account automatically. Use one of the two paths below.

---

## Path A — Easiest (recommended): one script on your Mac

This creates the GitHub repo **and** pushes the code for you.

### 1. Install prerequisites (if needed)

```bash
brew install gh node
gh auth login
```

### 2. Download the code from the Ash repo branch

```bash
cd ~/Desktop
git clone https://github.com/john-prad25/Ash-tracking-app.git
cd Ash-tracking-app
git checkout cursor/therapist-tracker-prototype-0ede
cd therapist-tracker
```

### 3. Create GitHub repo and push

```bash
chmod +x publish-to-github.sh start.sh "Start Session Desk.command"
./publish-to-github.sh
```

### 4. Clone the new repo and run

```bash
cd ~/Desktop
git clone https://github.com/john-prad25/session-desk.git
cd session-desk
npm install
npm run dev
```

Open **http://127.0.0.1:5173** — or double-click **`Start Session Desk.command`**.

---

## Path B — Create repo in browser first

### 1. Create empty repo

Open: **https://github.com/new?name=session-desk&description=Local-first+therapist+client+and+session+tracker**

- Owner: **john-prad25**
- Name: **session-desk**
- Public, **no** README / .gitignore / license
- Click **Create repository**

### 2. Tell the Cursor agent **"repo created"**

The agent can push the code from the cloud environment.

### 3. Clone on your Mac

```bash
git clone https://github.com/john-prad25/session-desk.git
cd session-desk
npm install
npm run dev
```

---

## Requirements

- **Node.js 22+** — https://nodejs.org
- **Chrome or Safari** — for voice transcription
