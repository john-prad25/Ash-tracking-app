import { endOfDay, isSameDay, startOfDay } from "date-fns";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDuration, formatTime } from "@/lib/format";
import {
  activeSpanSummary,
  openSpans,
  runningSpan,
  SPAN_KINDS,
  SPAN_META,
  spanMsInRange,
} from "@/lib/spans";
import type { DaySpan, SmokeLog, SpanKind } from "@/lib/types";
import { cn } from "@/lib/utils";

export function NoSmokeTracker({
  spans,
  logs,
  now,
  onToggle,
  onDelete,
}: {
  spans: DaySpan[];
  logs: SmokeLog[];
  now: number;
  onToggle: (kind: SpanKind) => void;
  onDelete: (id: string) => void;
}) {
  const live = useMemo(() => openSpans(spans), [spans]);
  const [picked, setPicked] = useState<SpanKind>(live[0]?.kind ?? "meal");

  useEffect(() => {
    if (live.length === 1) setPicked(live[0]!.kind);
  }, [live]);

  const todaySpans = useMemo(() => {
    const start = startOfDay(now);
    const end = endOfDay(now);
    return spans
      .filter((s) => spanMsInRange(s, start, end, now) > 0)
      .slice()
      .sort((a, b) => b.start - a.start);
  }, [spans, now]);

  const summary = useMemo(
    () => activeSpanSummary(spans, logs, startOfDay(now), endOfDay(now), now),
    [spans, logs, now],
  );

  const pickedMeta = SPAN_META[picked];

  function onChip(kind: SpanKind) {
    if (runningSpan(spans, kind)) {
      onToggle(kind);
      return;
    }
    setPicked(kind);
    if (live.length > 0) {
      onToggle(kind);
    }
  }

  return (
    <section className="stagger-in" style={{ animationDelay: "50ms" }}>
      <div className="mb-3">
        <h2 className="text-sm font-medium">No-smoke windows</h2>
        <p className="text-xs text-muted-foreground">
          Pick a category, start when you cannot light up, end when you can. Different kinds can
          run at the same time.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SPAN_KINDS.map((kind) => {
          const meta = SPAN_META[kind];
          const Icon = meta.icon;
          const kindLive = Boolean(runningSpan(spans, kind));
          const selected = kindLive || (!kindLive && picked === kind && live.length === 0);
          return (
            <button
              key={kind}
              type="button"
              onClick={() => onChip(kind)}
              aria-pressed={selected}
              aria-label={kindLive ? meta.end : meta.label}
              className={cn(
                "press-scale flex h-11 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-[background-color,color] duration-150",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
              {meta.label}
              {kindLive ? <span className="live-dot" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>

      {live.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {live.map((span) => (
            <Card key={span.id} className="flex flex-row items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Live
                </p>
                <p className="mt-1 font-display text-3xl leading-none tracking-tight tabular-nums">
                  {formatDuration((now - span.start) / 60_000)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {SPAN_META[span.kind].label} since {formatTime(span.start)}
                </p>
              </div>
              <Button type="button" onClick={() => onToggle(span.kind)}>
                End
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Button className="mt-4 w-full sm:w-auto" type="button" onClick={() => onToggle(picked)}>
          Start {pickedMeta.label.toLowerCase()}
        </Button>
      )}

      {summary.some((s) => s.smokes > 0) && (
        <p className="mt-3 text-xs text-muted-foreground">
          {summary
            .filter((s) => s.smokes > 0)
            .map((s) => `${s.smokes} during ${s.label.toLowerCase()}`)
            .join(" · ")}
          .
        </p>
      )}

      {todaySpans.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1">
          {todaySpans.map((span) => (
            <SpanRow key={span.id} span={span} now={now} onDelete={() => onDelete(span.id)} />
          ))}
        </ul>
      )}
    </section>
  );
}

function SpanRow({
  span,
  now,
  onDelete,
}: {
  span: DaySpan;
  now: number;
  onDelete: () => void;
}) {
  const meta = SPAN_META[span.kind];
  const Icon = meta.icon;
  const minutes = (span.end ?? now) - span.start;
  const crosses = !isSameDay(span.start, span.end ?? now);
  return (
    <li className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-secondary">
      <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          {meta.label}
          {span.end === null ? (
            <span className="ml-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Live
            </span>
          ) : null}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {formatTime(span.start)}
          {crosses ? " → " : "–"}
          {span.end ? formatTime(span.end) : "now"} · {formatDuration(minutes / 60_000)}
        </p>
      </div>
      <button
        type="button"
        className="relative size-11 text-muted-foreground hover:text-foreground"
        onClick={onDelete}
        aria-label={`Remove ${meta.label.toLowerCase()}`}
      >
        <Trash2 className="mx-auto size-4" />
      </button>
    </li>
  );
}
