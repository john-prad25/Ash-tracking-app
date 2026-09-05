# Ash

Private smoking and no-smoke tracker. Logs stay on the device. Nothing is sent to a server.

## What’s in this repo

| Folder | What it is |
| --- | --- |
| `src/` | Web app (Today, Dashboard, Packs, Patterns, Phone) |
| `ash-android/` | Android Studio project that wraps the app in a WebView |
| `Ash-Android-Studio.zip` | Same Android project as a zip, if you prefer not to clone |

## Open on a Mac (Android Studio)

1. Clone this repo:

```bash
git clone https://github.com/john-prad25/Ash-tracking-app.git
cd Ash-tracking-app
```

2. Open **Android Studio → File → Open**.
3. Select the **`ash-android`** folder (the one that contains `settings.gradle.kts`).
4. Let Gradle sync finish. The first sync can take several minutes.
5. On the phone, turn on **Developer options** and **USB debugging**.
6. Plug the phone in, pick it in the device dropdown, press **Run**.

The phone app is fully offline. Logs stay on the phone.

## Run the web app (optional)

Needs Node.js 22+.

```bash
npm install
npm run dev
```

Then open the URL Vite prints in the terminal.

## Privacy

Ash stores packs, cigarettes, and no-smoke spans in the browser (or on the phone). There is no account and no cloud sync.
