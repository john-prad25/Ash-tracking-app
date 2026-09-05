import { endOfDay, isSameDay, startOfDay } from "date-fns";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { NoSmokeTracker } from "@/components/no-smoke-tracker";
import { PackVisual } from "@/components/pack-visual";
import { Card } from "@/components/ui/card";
import { CONTEXTS, CONTEXT_BY_ID, GROUP_META, GROUP_ORDER } from "@/lib/contexts";
import { formatDuration, formatRelativeAgo, formatTime, plural } from "@/lib/format";
import { SPAN_META, spansCovering } from "@/lib/spans";
import { inRange, inventoryRemaining } from "@/lib/stats";
import { useAshStore } from "@/lib/store";
import type { ContextGroup, ContextId, SpanKind } from "@/lib/types";
import { cn } from "@/lib/utils";

function useNow(ms = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export function TodayView() {
  const logs = useAshStore((s) => s.logs);
  const purchases = useAshStore((s) => s.purchases);
  const spans = useAshStore((s) => s.spans);
  const settings = useAshStore((s) => s.settings);
  const addSmoke = useAshStore((s) => s.addSmoke);
  const undoSmoke = useAshStore((s) => s.undoSmoke);
  const restoreSmoke = useAshStore((s) => s.restoreSmoke);
  const toggleSpan = useAshStore((s) => s.toggleSpan);
  const undoSpanToggle = useAshStore((s) => s.undoSpanToggle);
  const deleteSpan = useAshStore((s) => s.deleteSpan);
  const anyOpen = spans.some((s) => s.end === null);
  const clockNow = useNow(anyOpen ? 1_000 : 60_000);
  const minuteNow = Math.floor(clockNow / 60_000) * 60_000;

  const todayLogs = useMemo(() => {
    const start = startOfDay(minuteNow);
    const end = endOfDay(minuteNow);
    return logs
      .filter((l) => inRange(l.at, start, end))
      .slice()
      .sort((a, b) => b.at - a.at);
  }, [logs, minuteNow]);

  const last = useMemo(
    () => logs.slice().sort((a, b) => b.at - a.at)[0],
    [logs],
  );

  const remaining = inventoryRemaining(logs, purchases);
  const minutesToday = todayLogs.length * settings.minutesPerCig;

  function log(context: ContextId) {
    const entry = addSmoke(context);
    const def = CONTEXT_BY_ID[context];
    const during = spansCovering(useAshStore.getState().spans, entry.at);
    const extra =
      during.length > 0
        ? ` during ${during.map((s) => SPAN_META[s.kind].label.toLowerCase()).join(", ")}`
        : "";
    toast(`Logged ${def.label.toLowerCase()}${extra}`, {
      action: {
        label: "Undo",
        onClick: () => undoSmoke(entry.id),
      },
    });
  }

  function removeLog(entry: (typeof todayLogs)[number]) {
    undoSmoke(entry.id);
    toast("Removed from today’s log", {
      action: {
        label: "Undo",
        onClick: () => restoreSmoke(entry),
      },
    });
  }

  function onToggle(kind: SpanKind) {
    const { action, span } = toggleSpan(kind);
    const meta = SPAN_META[kind];
    const minutes = Math.max(1, Math.round(((span.end ?? Date.now()) - span.start) / 60_000));
    toast(
      action === "start" ? `${meta.label} started` : `${meta.label} ended · ${formatDuration(minutes)}`,
      {
        action: {
          label: "Undo",
          onClick: () => undoSpanToggle(span.id),
        },
      },
    );
  }

  const remainingLabel =
    remaining < 0 ? `${Math.abs(remaining)} smoked past logged packs` : `${remaining} remaining`;

  return (
    <div className="flex flex-col gap-6">
      <section className="stagger-in grid grid-cols-2 gap-3">
        <Card className="col-span-2 sm:col-span-1">
          <p className="text-xs font-medium text-muted-foreground">Today</p>
          <p className="mt-2 font-display text-5xl leading-none tracking-tight tabular-nums">
            {todayLogs.length}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {plural(todayLogs.length, "cigarette")} · {minutesToday}m
          </p>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <p className="text-xs font-medium text-muted-foreground">Since the last</p>
          <p className="mt-2 font-display text-3xl leading-tight tracking-tight">
            {last ? formatRelativeAgo(last.at, minuteNow) : "—"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {last ? CONTEXT_BY_ID[last.context].label : "Nothing logged yet"}
          </p>
        </Card>
      </section>

      <NoSmokeTracker
        spans={spans}
        logs={logs}
        now={clockNow}
        onToggle={onToggle}
        onDelete={(id) => deleteSpan(id)}
      />

      <section className="stagger-in" style={{ animationDelay: "80ms" }}>
        <div className="mb-3">
          <h2 className="text-sm font-medium">Log one</h2>
          <p className="text-xs text-muted-foreground">Tap the moment. You can undo.</p>
        </div>
        <div className="flex flex-col gap-4">
          {GROUP_ORDER.map((group) => (
            <ContextGroupBlock key={group} group={group} onLog={log} />
          ))}
        </div>
      </section>

      <Card className="stagger-in" style={{ animationDelay: "120ms" }}>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-medium">Open pack</h2>
          <p className="text-xs tabular-nums text-muted-foreground">{remainingLabel}</p>
        </div>
        <PackVisual remaining={remaining} perPack={settings.cigsPerPack} />
      </Card>

      <section className="stagger-in pb-4" style={{ animationDelay: "160ms" }}>
        <h2 className="mb-3 text-sm font-medium">Today’s log</h2>
        {todayLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Empty so far. The first tap starts the day.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {todayLogs.map((logEntry) => {
              const def = CONTEXT_BY_ID[logEntry.context];
              const Icon = def.icon;
              const during = spansCovering(spans, logEntry.at, minuteNow);
              return (
                <li
                  key={logEntry.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-secondary"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{def.label}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {isSameDay(logEntry.at, minuteNow)
                        ? formatTime(logEntry.at)
                        : formatRelativeAgo(logEntry.at, minuteNow)}
                      {during.length > 0
                        ? ` · during ${during.map((s) => SPAN_META[s.kind].label.toLowerCase()).join(", ")}`
                        : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="relative size-11 text-muted-foreground hover:text-foreground"
                    onClick={() => removeLog(logEntry)}
                    aria-label="Remove"
                  >
                    <Trash2 className="mx-auto size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function ContextGroupBlock({
  group,
  onLog,
}: {
  group: ContextGroup;
  onLog: (id: ContextId) => void;
}) {
  const meta = GROUP_META[group];
  const items = CONTEXTS.filter((c) => c.group === group);
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {meta.label}
        </p>
        <p className="text-xs text-muted-foreground">{meta.hint}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onLog(item.id)}
              className={cn(
                "press-scale flex min-h-11 items-center gap-2.5 rounded-xl bg-card px-3 py-2.5 text-left shadow-[var(--shadow-border)] transition-[box-shadow,background-color] duration-150",
                "hover:shadow-[var(--shadow-border-hover)] hover:bg-accent",
              )}
              aria-label={item.label}
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <span className="text-sm leading-tight">{item.short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
