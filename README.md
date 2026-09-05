# Ash

Private smoking and no-smoke tracker. Logs stay on the device. Nothing is sent to a server.

## What’s in this repo

| Folder | What it is |
| --- | --- |
| `src/` | Web app (Today, Dashboard, Packs, Patterns, Phone) |
| `ash-android/` | Android Studio project that wraps the built web app in a WebView |

The APK does **not** ship a separate rewrite of the tracker. `npm run build:android` Vite-builds the React app into `ash-android/app/src/main/assets/`. Skip that step and Android Studio packages a stale build.

## Build an APK and sideload it

Needs Node.js 22+ and Android Studio.

1. Clone and install:

```bash
git clone https://github.com/john-prad25/Ash-tracking-app.git
cd Ash-tracking-app
npm install
```

2. Refresh the app inside the Android project (re-run this after **any** change under `src/`):

```bash
npm run build:android
```

3. Android Studio → **File → Open**.
4. Select the **`ash-android`** folder (the one that contains `settings.gradle.kts`).
5. Let Gradle sync finish. The first sync can take several minutes.
6. **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
7. Locate `app-debug.apk` under `ash-android/app/build/outputs/apk/debug/`.
8. Copy the APK to the phone, allow install from unknown sources for that transfer app, open the APK, and install.

The phone app is fully offline. Packs, cigarettes, and no-smoke windows never leave the device. Android backup of WebView storage is turned off.

## Run the web app (optional)

```bash
npm install
npm run dev
```

Then open the URL Vite prints in the terminal.

## Privacy

Ash stores packs, cigarettes, and no-smoke spans in the browser (or on the phone). There is no account, no cloud sync, and no INTERNET permission on the APK.
