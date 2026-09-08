# Session Desk — Therapist Tracker (Prototype)

A local-first prototype for narrative therapy client and session tracking. Built to demo on a MacBook — all data stays in the browser (IndexedDB). No server or account required.

## Quick start (Mac)

**Important:** `http://127.0.0.1:5173` only works after you start the app on your Mac. It does not run automatically.

### Option A — double-click (easiest)

1. Make sure you have the code (branch `cursor/therapist-tracker-prototype-0ede` or merged PR #3).
2. In Finder, open the `therapist-tracker` folder.
3. Double-click **`Start Session Desk.command`**.
4. If macOS blocks it: right-click → **Open** → **Open** again.

### Option B — terminal

```bash
cd therapist-tracker
npm install
npm run dev
```

Open **http://127.0.0.1:5173** in Chrome or Safari (the start script can open it for you).

> **Voice transcription** uses the browser’s built-in Web Speech API. It works best in Chrome or Safari on macOS with microphone permission granted.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| **Page not found / can't connect** | The dev server isn't running. Run `npm run dev` inside `therapist-tracker` (not the repo root). |
| **`therapist-tracker` folder missing** | Pull the branch: `git fetch origin cursor/therapist-tracker-prototype-0ede && git checkout cursor/therapist-tracker-prototype-0ede` |
| **Wrong app loads (Ash tracker)** | The root app runs on port **8080**. Session Desk runs on **5173** from inside `therapist-tracker/`. |
| **Port 5173 already in use** | Stop the other process, or run `PORT=5174 npm run dev` and open that port instead. |
| **Blank page after opening** | Hard-refresh (Cmd+Shift+R) or try Chrome instead of Safari. |

## What's included

| Area | Features |
| --- | --- |
| **Clients** | Add/edit client profiles (name, age, gender, contact, notes) |
| **Sessions** | Start session, set cost/modality/intro flag, typed notes, voice transcription, complete session |
| **Calendar** | Month view of local sessions + Calendly bookings; filter by client |
| **Dashboard 1** | Total sessions, revenue, time spent, patient list, monthly revenue chart |
| **Dashboard 2** | Per-client session history (newest first), one-click notes view |
| **Calendly** | Booking link + iCal feed sync (no API key). Manual `.ics` import fallback. |

Demo data loads automatically on first run so you can show the app immediately.

## Calendly setup (no API)

1. Open **Settings** in the app.
2. Paste your **Calendly booking page URL** (e.g. `https://calendly.com/your-name/30min`).
3. Paste your **secret iCal URL** from Calendly → Integrations → Calendar sync.
4. Click **Sync iCal feed now** or use **Sync Calendly** on the Calendar page.

If direct sync fails (CORS outside dev mode), download the `.ics` file from Calendly and use **Import .ics file** in Settings.

## Data & privacy

- All data is stored locally in IndexedDB (`TherapistTrackerDB`).
- Nothing is sent to a cloud server.
- Voice audio is transcribed in-browser; audio is not uploaded.
- Clear browser site data to reset the prototype.

## Build for offline demo

```bash
npm run build
npm run preview
```

Serve the `dist/` folder or run preview locally before a client meeting.

## Not in this prototype

- PDF invoice generation (planned for a later phase)
- Full Calendly API / webhooks
- Multi-device sync or encryption at rest
- macOS native app wrapper (Tauri) — web prototype only for now

## Tech stack

- React 19 + TypeScript + Vite
- Dexie (IndexedDB)
- Tailwind CSS 4
- Recharts
- ical.js (Calendly feed parsing)
- Web Speech API (voice notes)
