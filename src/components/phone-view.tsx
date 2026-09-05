import { Smartphone, Terminal, Usb } from "lucide-react";
import { Card } from "@/components/ui/card";

export function PhoneView() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl tracking-tight">On your phone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Build the APK on your Mac, then sideload it. Logs stay on the phone. Nothing is sent
          anywhere.
        </p>
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <Terminal className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              First
            </p>
            <h3 className="mt-2 text-sm font-medium">Refresh the app inside the APK</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              From the repo root, after any change to the tracker:
            </p>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-secondary px-3 py-3 text-xs leading-5 text-foreground">
              {`npm install
npm run build:android`}
            </pre>
            <p className="mt-3 text-sm text-muted-foreground">
              Skip this and Android Studio will package a stale build.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <Smartphone className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <div>
            <h3 className="mt-2 text-sm font-medium">Open the Android project</h3>
            <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm text-muted-foreground">
              <li>Android Studio → File → Open.</li>
              <li>Select the ash-android folder (the one with settings.gradle.kts).</li>
              <li>Let Gradle sync finish. The first sync can take several minutes.</li>
              <li>Build → Build Bundle(s) / APK(s) → Build APK(s).</li>
              <li>
                Locate app-debug.apk under ash-android/app/build/outputs/apk/debug/.
              </li>
            </ol>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <Usb className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <div>
            <h3 className="text-sm font-medium">Install on the phone</h3>
            <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm text-muted-foreground">
              <li>Copy the APK to the phone (AirDrop, Drive, USB, whatever you use).</li>
              <li>On the phone, allow install from unknown sources for that transfer app.</li>
              <li>Open the APK and install. Play Protect may ask once; that is expected.</li>
            </ol>
            <p className="mt-3 text-sm text-muted-foreground">
              The app is fully offline. Packs, cigarettes, and no-smoke windows never leave the
              device.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
