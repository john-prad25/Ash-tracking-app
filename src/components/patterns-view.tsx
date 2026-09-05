import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ChartTooltip } from "@/components/chart-tooltip";
import { PeriodToggle } from "@/components/period-toggle";
import { Card } from "@/components/ui/card";
import { CONTEXT_BY_ID, GROUP_META } from "@/lib/contexts";
import { formatDuration } from "@/lib/format";
import { activeSpanSummary } from "@/lib/spans";
import { periodLabel, periodRange, summarizeRange } from "@/lib/stats";
import { useAshStore } from "@/lib/store";
import type { Period } from "@/lib/types";

export function PatternsView() {
  const logs = useAshStore((s) => s.logs);
  const purchases = useAshStore((s) => s.purchases);
  const spans = useAshStore((s) => s.spans);
  const settings = useAshStore((s) => s.settings);
  const [period, setPeriod] = useState<Period>("month");
  const [anchor] = useState(() => new Date());

  const { start, end } = useMemo(() => periodRange(period, anchor), [period, anchor]);
  const summary = useMemo(
    () => summarizeRange(logs, purchases, settings, start, end, period),
    [logs, purchases, settings, start, end, period],
  );
  const spanSummary = useMemo(
    () => activeSpanSummary(spans, logs, start, end),
    [spans, logs, start, end],
  );

  const total = summary.count || 1;
  const hourData = summary.byHour.map((h) => ({
    label: String(h.hour).padStart(2, "0"),
    count: h.count,
  }));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl tracking-tight">Patterns</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Before, after, and around — {periodLabel(period, start, end)}.
        </p>
      </div>

      <PeriodToggle value={period} onChange={setPeriod} />

      {spanSummary.length > 0 && (
        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-medium">No-smoke windows</h3>
            <p className="text-xs text-muted-foreground">Ranked by time you marked as off-limits</p>
          </div>
          <ul className="flex flex-col gap-3">
            {spanSummary.map((row) => {
              const max = spanSummary[0]?.minutes || 1;
              return (
                <li key={row.kind}>
                  <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                    <span>{row.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatDuration(row.minutes)}
                      {row.smokes > 0 ? ` · ${row.smokes} smokes` : ""}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(row.minutes / max) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-2">
        {summary.byGroup.map((g) => (
          <Card key={g.group} className="p-3 sm:p-4">
            <p className="text-xs text-muted-foreground">{GROUP_META[g.group].label}</p>
            <p className="mt-1 font-display text-2xl tabular-nums">{g.count}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {Math.round((g.count / total) * 100)}%
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-4">
          <h3 className="text-sm font-medium">Moments</h3>
          <p className="text-xs text-muted-foreground">Ranked by how often they show up</p>
        </div>
        {summary.byContext.length === 0 ? (
          <p className="text-sm text-muted-foreground">No logs in this stretch.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {summary.byContext.map((row) => {
              const max = summary.byContext[0]?.count ?? 1;
              const def = CONTEXT_BY_ID[row.id];
              const Icon = def.icon;
              return (
                <li key={row.id}>
                  <div className="mb-1 flex items-center gap-2">
                    <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                    <span className="flex-1 text-sm">{def.label}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {row.count} · {Math.round((row.count / total) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(row.count / max) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <div className="mb-4">
          <h3 className="text-sm font-medium">Hour of day</h3>
          <p className="text-xs text-muted-foreground">When the habit clusters</p>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourData} barCategoryGap="12%">
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={3}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              />
              <Tooltip cursor={{ fill: "var(--color-secondary)" }} content={<ChartTooltip />} />
              <Bar dataKey="count" fill="var(--color-chart-2)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="mb-4">
          <h3 className="text-sm font-medium">Day of week</h3>
        </div>
        <ul className="grid grid-cols-7 gap-1.5">
          {summary.byWeekday.map((d) => {
            const max = Math.max(...summary.byWeekday.map((x) => x.count), 1);
            return (
              <li key={d.day} className="flex flex-col items-center gap-2">
                <div className="flex h-24 w-full items-end rounded-lg bg-secondary px-1 py-1">
                  <div
                    className="w-full rounded-sm bg-primary"
                    style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 8 : 0)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{d.label}</span>
                <span className="text-xs tabular-nums">{d.count}</span>
              </li>
            );
          })}
        </ul>
      </Card>

      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
        {summary.topContext && (
          <li>
            Most often {summary.topContext.label.toLowerCase()} ({summary.topContext.pct}%).
          </li>
        )}
        {summary.heaviestWeekday && (
          <li>
            {summary.heaviestWeekday.label} carries the most, at {summary.heaviestWeekday.count}{" "}
            cigarettes.
          </li>
        )}
        {summary.avgGapMinutes !== null && (
          <li>
            Average gap in this stretch is {formatDuration(summary.avgGapMinutes)}.
          </li>
        )}
        <li>Time in this stretch: {formatDuration(summary.minutes)} smoking.</li>
      </ul>
    </div>
  );
}
