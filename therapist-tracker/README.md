# Session Desk — Therapist Tracker (Prototype)

A local-first prototype for narrative therapy client and session tracking. Built to demo on a MacBook — all data stays in the browser (IndexedDB). No server or account required.

## Quick start (Mac)

```bash
cd therapist-tracker
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://127.0.0.1:5173`) in **Chrome** or **Safari**.

> **Voice transcription** uses the browser’s built-in Web Speech API. It works best in Chrome or Safari on macOS with microphone permission granted.

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
