import { lazy, Suspense, useLayoutEffect, useState } from "react";
import { Toaster } from "sonner";
import { PacksView } from "@/components/packs-view";
import { PhoneView } from "@/components/phone-view";
import { SettingsDialog } from "@/components/settings-dialog";
import { TodayView } from "@/components/today-view";
import { Button } from "@/components/ui/button";
import { useAshStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const DashboardView = lazy(() =>
  import("@/components/dashboard-view").then((m) => ({ default: m.DashboardView })),
);
const PatternsView = lazy(() =>
  import("@/components/patterns-view").then((m) => ({ default: m.PatternsView })),
);

type Tab = "today" | "dashboard" | "packs" | "patterns" | "phone";

const TABS: { id: Tab; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "dashboard", label: "Dashboard" },
  { id: "packs", label: "Packs" },
  { id: "patterns", label: "Patterns" },
  { id: "phone", label: "Phone" },
];

export function AppShell() {
  const [tab, setTab] = useState<Tab>("today");

  useLayoutEffect(() => {
    useAshStore.persist.rehydrate();
    useAshStore.getState().ensureSeeded();
  }, []);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <div className="mx-auto w-full max-w-3xl px-5">
        <SampleBanner />
        <nav className="sticky top-0 z-20 -mx-5 mb-6 bg-background/90 px-5 py-3 backdrop-blur-sm">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "h-11 shrink-0 rounded-full px-4 text-sm font-medium transition-[background-color,color] duration-150",
                  tab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </nav>
        <main className="pb-16">
          {tab === "today" && <TodayView />}
          {tab === "packs" && <PacksView />}
          {tab === "phone" && <PhoneView />}
          {tab === "dashboard" && (
            <Suspense fallback={<PanelFallback />}>
              <DashboardView />
            </Suspense>
          )}
          {tab === "patterns" && (
            <Suspense fallback={<PanelFallback />}>
              <PatternsView />
            </Suspense>
          )}
        </main>
      </div>
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          className:
            "bg-popover text-popover-foreground shadow-[var(--shadow-border)] border-0",
        }}
      />
    </div>
  );
}

function PanelFallback() {
  return <p className="text-sm text-muted-foreground">Loading this view…</p>;
}

function Header() {
  return (
    <header className="mx-auto flex w-full max-w-3xl items-start justify-between gap-4 px-5 pt-8 pb-2">
      <div>
        <p className="font-display text-4xl leading-none tracking-tight italic">Ash</p>
        <p className="mt-2 text-sm text-muted-foreground">A private smoking ledger</p>
      </div>
      <SettingsDialog />
    </header>
  );
}

function SampleBanner() {
  const isSample = useAshStore((s) => s.isSample);
  const dismissSample = useAshStore((s) => s.dismissSample);
  const startFresh = useAshStore((s) => s.startFresh);
  if (!isSample) return null;
  return (
    <div className="mb-2 rounded-2xl bg-secondary px-4 py-3">
      <p className="text-sm">A sample month is loaded so the dashboard has shape.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={startFresh}>
          Start fresh
        </Button>
        <Button size="sm" variant="ghost" onClick={dismissSample}>
          Keep it
        </Button>
      </div>
    </div>
  );
}
