import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { ChartTooltip } from "@/components/chart-tooltip";
import { PeriodToggle } from "@/components/period-toggle";
import { Card } from "@/components/ui/card";
import { formatDuration, formatMoney } from "@/lib/format";
import { SPAN_META, activeSpanSummary } from "@/lib/spans";
import { deltaPct, periodLabel, periodRange, shiftAnchor, summarizeRange } from "@/lib/stats";
import { useAshStore } from "@/lib/store";
import type { Period } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const logs = useAshStore((s) => s.logs);
  const purchases = useAshStore((s) => s.purchases);
  const spans = useAshStore((s) => s.spans);
  const settings = useAshStore((s) => s.settings);
  const [period, setPeriod] = useState<Period>("week");
  const [anchor, setAnchor] = useState(() => new Date());

  const { start, end } = useMemo(() => periodRange(period, anchor), [period, anchor]);
  const summary = useMemo(
    () => summarizeRange(logs, purchases, settings, start, end, period),
    [logs, purchases, settings, start, end, period],
  );
  const spanSummary = useMemo(
    () => activeSpanSummary(spans, logs, start, end),
    [spans, logs, start, end],
  );

  const label = periodLabel(period, start, end);
  const chartData =
    period === "day"
      ? summary.byHour
          .filter((h) => h.hour >= 6 && h.hour <= 23)
          .map((h) => ({
            label: `${String(h.hour).padStart(2, "0")}`,
            count: h.count,
          }))
      : summary.byDay.map((d) => ({ label: d.label, count: d.count }));

  const countDelta = deltaPct(summary.count, summary.prevCount);
  const costDelta = deltaPct(summary.burned, summary.prevBurned);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <PeriodToggle value={period} onChange={setPeriod} />
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={() => setAnchor((d) => shiftAnchor(period, d, -1))}
            aria-label="Previous period"
          >
            <ChevronLeft className="size-5" />
          </button>
          <p className="text-sm font-medium">{label}</p>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={() => setAnchor((d) => shiftAnchor(period, d, 1))}
            aria-label="Next period"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat
          label="Cigarettes"
          value={String(summary.count)}
          hint={`${countDelta >= 0 ? "+" : ""}${countDelta}% vs prior`}
          delta={countDelta}
        />
        <Stat
          label="Time"
          value={formatDuration(summary.minutes)}
          hint={`${formatDuration(summary.prevMinutes)} prior`}
        />
        <Stat
          label="Burned"
          value={formatMoney(summary.burned, settings.currency)}
          hint={`${costDelta >= 0 ? "+" : ""}${costDelta}% vs prior`}
          delta={costDelta}
        />
        <Stat
          label="Spent"
          value={formatMoney(summary.spent, settings.currency)}
          hint="Packs bought in period"
        />
      </div>

      <Card>
        <div className="mb-4">
          <h3 className="text-sm font-medium">No-smoke windows</h3>
          <p className="text-xs text-muted-foreground">Time spent where you could not light up</p>
        </div>
        {spanSummary.length === 0 ? (
          <p className="text-sm text-muted-foreground">None marked in this stretch.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {spanSummary.map((row) => {
              const max = Math.max(...spanSummary.map((x) => x.minutes), 1);
              const Icon = SPAN_META[row.kind].icon;
              return (
                <li key={row.kind}>
                  <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2">
                      <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                      {row.label}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatDuration(row.minutes)}
                      {row.count > 0 ? ` · ${row.count}` : ""}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-200"
                      style={{ width: `${(row.minutes / max) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {spanSummary.some((s) => s.smokes > 0) && (
          <p className="mt-4 text-xs text-muted-foreground">
            {spanSummary
              .filter((s) => s.smokes > 0)
              .map((s) => `${s.smokes} during ${s.label.toLowerCase()}`)
              .join(" · ")}
            .
          </p>
        )}
      </Card>

      <Card>
        <div className="mb-4">
          <h3 className="text-sm font-medium">
            {period === "day" ? "By hour" : "By day"}
          </h3>
          <p className="text-xs text-muted-foreground">Count of cigarettes logged</p>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="18%">
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={period === "month" ? 3 : 0}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: "var(--color-secondary)" }}
                content={<ChartTooltip />}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="var(--color-primary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="mb-4">
          <h3 className="text-sm font-medium">Where it sits</h3>
          <p className="text-xs text-muted-foreground">Before, after, and around the day</p>
        </div>
        <ul className="flex flex-col gap-3">
          {summary.byGroup.map((g) => {
            const max = Math.max(...summary.byGroup.map((x) => x.count), 1);
            const names = { before: "Before", after: "After", around: "Around" };
            return (
              <li key={g.group}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span>{names[g.group]}</span>
                  <span className="tabular-nums text-muted-foreground">{g.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-200"
                    style={{ width: `${(g.count / max) * 100}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {summary.topContext && (
        <p className="text-sm text-muted-foreground">
          {summary.topContext.label} accounts for {summary.topContext.pct}% of this {period}.
          {summary.heaviestWeekday
            ? ` ${summary.heaviestWeekday.label}s are the heaviest.`
            : ""}
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  delta,
}: {
  label: string;
  value: string;
  hint: string;
  delta?: number;
}) {
  return (
    <Card className="gap-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl leading-none tracking-tight tabular-nums sm:text-3xl">
        {value}
      </p>
      <p
        className={cn(
          "mt-2 text-xs",
          delta === undefined
            ? "text-muted-foreground"
            : delta > 0
              ? "text-warning"
              : delta < 0
                ? "text-muted-foreground"
                : "text-muted-foreground",
        )}
      >
        {hint}
      </p>
    </Card>
  );
}
