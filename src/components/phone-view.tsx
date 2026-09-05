import { useRef, useState } from "react";
import { Check, Copy, Download, Share2, Smartphone, Terminal, Usb } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ANDROID_ZIP_BASE64,
  ANDROID_ZIP_NAME,
  copyAndroidProjectBase64,
  downloadAndroidProject,
  MAC_DECODE_COMMAND,
} from "@/lib/android-zip";

export function PhoneView() {
  const [copied, setCopied] = useState(false);
  const blobRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl tracking-tight">On your phone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Android Studio is installed. Get the project onto the Mac, open the
          unzipped Ash folder, plug the phone in, press Run.
        </p>
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Done
            </p>
            <h3 className="mt-2 text-sm font-medium">Android Studio on the MacBook</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              If Studio still wants to finish its first-run SDK download, let that
              finish before you open the project. It only happens once.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <Smartphone className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Next
            </p>
            <h3 className="mt-2 text-sm font-medium">Get Ash onto the Mac</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The in-app Save button is blocked inside this preview. Use Copy,
              then one Terminal line. That writes {ANDROID_ZIP_NAME} to Downloads.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={async () => {
                  const ok = await copyAndroidProjectBase64();
                  if (ok) {
                    setCopied(true);
                    toast("Copied. Paste is waiting in Terminal.");
                  } else {
                    blobRef.current?.focus();
                    blobRef.current?.select();
                    toast("Select the block below, then copy.");
                  }
                }}
              >
                <Copy className="size-4" />
                {copied ? "Copied" : "Copy project"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  const result = await downloadAndroidProject();
                  if (result === "saved") toast(`Saving ${ANDROID_ZIP_NAME}`);
                  if (result === "blocked") {
                    toast("Save is blocked here. Use Copy, then Terminal.");
                  }
                }}
              >
                <Download className="size-4" />
                Try Save anyway
              </Button>
            </div>
            <div className="mt-4 rounded-lg bg-secondary px-3 py-3">
              <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <Terminal className="size-3.5" strokeWidth={1.75} />
                Then in Terminal
              </p>
              <pre className="mt-2 overflow-x-auto text-xs leading-5 text-foreground">
                {MAC_DECODE_COMMAND}
              </pre>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Unzip that file. In Android Studio: File → Open → the Ash folder.
            </p>
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                If Copy is blocked, select this block instead
              </summary>
              <textarea
                ref={blobRef}
                readOnly
                value={ANDROID_ZIP_BASE64}
                className="mt-2 h-28 w-full resize-none rounded-md border border-border bg-background p-2 font-mono text-[11px] leading-4 text-muted-foreground"
                onFocus={(event) => event.currentTarget.select()}
              />
            </details>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <Usb className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <div>
            <h3 className="text-sm font-medium">Then the phone</h3>
            <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm text-muted-foreground">
              <li>
                Settings → About phone → tap Build number seven times until it says
                you are a developer.
              </li>
              <li>
                Back one screen → Developer options → turn on USB debugging.
              </li>
              <li>Plug the phone into the Mac with a data cable, not charge-only.</li>
              <li>On the phone, allow USB debugging for this computer.</li>
              <li>
                In Studio, pick the phone in the device list at the top, then press
                the green Run button. Ash installs and opens.
              </li>
            </ol>
            <p className="mt-3 text-sm text-muted-foreground">
              Play Protect may ask you to confirm the first launch. That is
              expected for a sideload. After that it is just an app on the home
              screen — offline, logs stay on the phone.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <Share2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <div>
            <h3 className="text-sm font-medium">If you want an APK file to send</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              After a successful Run, Studio has already installed it on that
              phone. To share: Build → Build Bundle(s) / APK(s) → Build APK(s),
              then locate. AirDrop or Drive that file. Each person gets their own
              empty ledger.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
