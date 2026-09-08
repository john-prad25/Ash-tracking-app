import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { getContextDef, GROUP_ORDER } from "./contexts.ts";
import { purchaseTotalCigs, totalPurchasedCigs } from "./purchases.ts";
import type {
  ContextGroup,
  CustomContext,
  GiveAwayLog,
  Period,
  Purchase,
  Settings,
  SmokeLog,
} from "./types";

const WEEK = { weekStartsOn: 1 as const };

export function periodRange(period: Period, anchor: Date) {
  if (period === "day") {
    return { start: startOfDay(anchor), end: endOfDay(anchor) };
  }
  if (period === "week") {
    return { start: startOfWeek(anchor, WEEK), end: endOfWeek(anchor, WEEK) };
  }
  return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
}

export function shiftAnchor(period: Period, anchor: Date, direction: -1 | 1) {
  if (period === "day") return addDays(anchor, direction);
  if (period === "week") return addWeeks(anchor, direction);
  return addMonths(anchor, direction);
}

/** Calendar-correct previous window: shift the period start, then re-run periodRange. */
export function previousRange(period: Period, start: Date) {
  const anchor =
    period === "day" ? subDays(start, 1) : period === "week" ? subWeeks(start, 1) : subMonths(start, 1);
  return periodRange(period, anchor);
}

export function inRange(at: number, start: Date, end: Date) {
  return at >= start.getTime() && at <= end.getTime();
}

export function periodLabel(period: Period, start: Date, end: Date, now = new Date()) {
  if (period === "day") {
    if (startOfDay(now).getTime() === start.getTime()) return "Today";
    return format(start, "EEE d MMM");
  }
  if (period === "week") {
    return `${format(start, "d MMM")} – ${format(end, "d MMM")}`;
  }
  return format(start, "MMMM yyyy");
}

export function totalGivenAway(giveAways: GiveAwayLog[]) {
  return giveAways.reduce((sum, g) => sum + g.count, 0);
}

export function inventoryRemaining(
  logs: SmokeLog[],
  purchases: Purchase[],
  giveAways: GiveAwayLog[] = [],
) {
  const bought = totalPurchasedCigs(purchases);
  return bought - logs.length - totalGivenAway(giveAways);
}

export interface OpenPackState {
  remaining: number;
  openPackRemaining: number;
  openPackCapacity: number;
  sealedCigarettes: number;
}

export function openPackState(
  logs: SmokeLog[],
  purchases: Purchase[],
  giveAways: GiveAwayLog[],
  fallbackCapacity: number,
): OpenPackState {
  const remaining = inventoryRemaining(logs, purchases, giveAways);
  const consumed = logs.length + totalGivenAway(giveAways);
  const sorted = purchases.slice().sort((a, b) => a.at - b.at);

  let consumedLeft = consumed;
  for (let i = 0; i < sorted.length; i += 1) {
    const purchase = sorted[i]!;
    const total = purchaseTotalCigs(purchase);
    if (consumedLeft >= total) {
      consumedLeft -= total;
      continue;
    }
    const openPackRemaining = total - consumedLeft;
    const sealedCigarettes = sorted
      .slice(i + 1)
      .reduce((sum, p) => sum + purchaseTotalCigs(p), 0);
    return {
      remaining,
      openPackCapacity: total,
      openPackRemaining,
      sealedCigarettes,
    };
  }

  return {
    remaining,
    openPackCapacity: fallbackCapacity,
    openPackRemaining: Math.max(remaining, 0),
    sealedCigarettes: 0,
  };
}

export function costPerCigarette(purchases: Purchase[], fallback: number) {
  const cigs = totalPurchasedCigs(purchases);
  const cost = purchases.reduce((sum, p) => sum + p.cost, 0);
  if (cigs <= 0) return fallback;
  return cost / cigs;
}

type InventoryEvent =
  | { at: number; kind: "smoke"; id: string }
  | { at: number; kind: "give"; id: string; count: number };

function inventoryEvents(logs: SmokeLog[], giveAways: GiveAwayLog[]): InventoryEvent[] {
  const events: InventoryEvent[] = [
    ...logs.map((l) => ({ at: l.at, kind: "smoke" as const, id: l.id })),
    ...giveAways.map((g) => ({ at: g.at, kind: "give" as const, id: g.id, count: g.count })),
  ];
  return events.sort((a, b) => a.at - b.at);
}

/** FIFO: assign each smoke the cost of the pack it came from. */
export function assignSmokeCosts(
  logs: SmokeLog[],
  purchases: Purchase[],
  giveAways: GiveAwayLog[],
  fallbackPerCig: number,
): Map<string, number> {
  const map = new Map<string, number>();
  const lots = purchases
    .slice()
    .sort((a, b) => a.at - b.at)
    .map((p) => {
      const total = purchaseTotalCigs(p);
      return {
        at: p.at,
        remaining: total,
        per: total > 0 ? p.cost / total : fallbackPerCig,
      };
    });

  for (const event of inventoryEvents(logs, giveAways)) {
    if (event.kind === "give") {
      let left = event.count;
      while (left > 0) {
        const lot = lots.find((l) => l.remaining > 0 && l.at <= event.at);
        if (!lot) break;
        const take = Math.min(left, lot.remaining);
        lot.remaining -= take;
        left -= take;
      }
      continue;
    }
    const lot = lots.find((l) => l.remaining > 0 && l.at <= event.at);
    if (lot) {
      lot.remaining -= 1;
      map.set(event.id, lot.per);
    } else {
      map.set(event.id, fallbackPerCig);
    }
  }
  return map;
}

export interface RangeSummary {
  count: number;
  minutes: number;
  spent: number;
  burned: number;
  prevCount: number;
  prevMinutes: number;
  prevSpent: number;
  prevBurned: number;
  byContext: { id: string; label: string; group: ContextGroup; count: number }[];
  byGroup: { group: ContextGroup; count: number }[];
  byDay: { key: string; label: string; count: number; burned: number }[];
  byHour: { hour: number; count: number }[];
  byWeekday: { day: number; label: string; count: number }[];
  topContext: { id: string; label: string; count: number; pct: number } | null;
  heaviestWeekday: { label: string; count: number } | null;
  avgGapMinutes: number | null;
}

export function summarizeRange(
  logs: SmokeLog[],
  purchases: Purchase[],
  giveAways: GiveAwayLog[],
  customContexts: CustomContext[],
  settings: Settings,
  start: Date,
  end: Date,
  period: Period,
): RangeSummary {
  const fallback = settings.cigsPerPack > 0 ? settings.defaultPackCost / settings.cigsPerPack : 0;
  const costs = assignSmokeCosts(logs, purchases, giveAways, fallback);
  const prevWindow = previousRange(period, start);

  const inCurrent = logs.filter((l) => inRange(l.at, start, end));
  const inPrev = logs.filter((l) => inRange(l.at, prevWindow.start, prevWindow.end));
  const purchasesCurrent = purchases.filter((p) => inRange(p.at, start, end));
  const purchasesPrev = purchases.filter((p) => inRange(p.at, prevWindow.start, prevWindow.end));

  const burned = inCurrent.reduce((sum, l) => sum + (costs.get(l.id) ?? fallback), 0);
  const prevBurned = inPrev.reduce((sum, l) => sum + (costs.get(l.id) ?? fallback), 0);

  const contextCounts = new Map<string, number>();
  for (const log of inCurrent) {
    contextCounts.set(log.context, (contextCounts.get(log.context) ?? 0) + 1);
  }

  const byContext = [...contextCounts.entries()]
    .map(([id, count]) => {
      const def = getContextDef(id, customContexts);
      return {
        id,
        label: def.short,
        group: def.group,
        count,
      };
    })
    .sort((a, b) => b.count - a.count);

  const byGroup = GROUP_ORDER.map((group) => ({
    group,
    count: byContext.filter((c) => c.group === group).reduce((s, c) => s + c.count, 0),
  }));

  const days = eachDayOfInterval({ start, end });
  const byDay = days.map((d) => {
    const ds = startOfDay(d);
    const de = endOfDay(d);
    const dayLogs = inCurrent.filter((l) => inRange(l.at, ds, de));
    return {
      key: format(d, "yyyy-MM-dd"),
      label: days.length > 10 ? format(d, "d") : format(d, "EEE"),
      count: dayLogs.length,
      burned: dayLogs.reduce((sum, l) => sum + (costs.get(l.id) ?? fallback), 0),
    };
  });

  const byHour = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: inCurrent.filter((l) => new Date(l.at).getHours() === hour).length,
  }));

  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekdayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const byWeekday = weekdayShort.map((label, day) => ({
    day,
    label,
    count: inCurrent.filter((l) => new Date(l.at).getDay() === day).length,
  }));
  const mondayFirst = [...byWeekday.slice(1), byWeekday[0]!];

  const top = byContext[0];
  const topContext = top
    ? {
        id: top.id,
        label: getContextDef(top.id, customContexts).label,
        count: top.count,
        pct: inCurrent.length > 0 ? Math.round((top.count / inCurrent.length) * 100) : 0,
      }
    : null;

  const heaviest = mondayFirst.slice().sort((a, b) => b.count - a.count)[0];
  const heaviestWeekday =
    heaviest && heaviest.count > 0
      ? { label: weekdayNames[heaviest.day] ?? heaviest.label, count: heaviest.count }
      : null;

  const ordered = inCurrent.slice().sort((a, b) => a.at - b.at);
  let avgGapMinutes: number | null = null;
  if (ordered.length >= 2) {
    let gapSum = 0;
    for (let i = 1; i < ordered.length; i += 1) {
      gapSum += (ordered[i]!.at - ordered[i - 1]!.at) / 60_000;
    }
    avgGapMinutes = gapSum / (ordered.length - 1);
  }

  return {
    count: inCurrent.length,
    minutes: inCurrent.length * settings.minutesPerCig,
    spent: purchasesCurrent.reduce((s, p) => s + p.cost, 0),
    burned,
    prevCount: inPrev.length,
    prevMinutes: inPrev.length * settings.minutesPerCig,
    prevSpent: purchasesPrev.reduce((s, p) => s + p.cost, 0),
    prevBurned,
    byContext,
    byGroup,
    byDay,
    byHour,
    byWeekday: mondayFirst,
    topContext,
    heaviestWeekday,
    avgGapMinutes,
  };
}

export function deltaPct(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}
