import { setHours, setMinutes, startOfDay, subDays } from "date-fns";
import type { ContextId, DaySpan, Purchase, SmokeLog } from "./types";
import { uid } from "./utils";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stamp(day: Date, hour: number, minute: number) {
  return setMinutes(setHours(day, hour), minute).getTime();
}

interface Slot {
  hour: number;
  minute: number;
  context: ContextId;
  weekend?: boolean;
  weekday?: boolean;
  chance: number;
}

const SLOTS: Slot[] = [
  { hour: 7, minute: 35, context: "morning", weekday: true, chance: 0.92 },
  { hour: 8, minute: 50, context: "commute", weekday: true, chance: 0.7 },
  { hour: 9, minute: 20, context: "morning", weekend: true, chance: 0.8 },
  { hour: 10, minute: 18, context: "coffee", chance: 0.78 },
  { hour: 11, minute: 5, context: "before_meeting", weekday: true, chance: 0.35 },
  { hour: 11, minute: 40, context: "before_meal", chance: 0.28 },
  { hour: 12, minute: 42, context: "after_meal", chance: 0.9 },
  { hour: 14, minute: 10, context: "after_meeting", weekday: true, chance: 0.4 },
  { hour: 15, minute: 22, context: "work_break", weekday: true, chance: 0.72 },
  { hour: 15, minute: 50, context: "boredom", weekend: true, chance: 0.45 },
  { hour: 16, minute: 8, context: "stress", weekday: true, chance: 0.38 },
  { hour: 17, minute: 45, context: "commute", weekday: true, chance: 0.55 },
  { hour: 18, minute: 12, context: "social", weekend: true, chance: 0.7 },
  { hour: 19, minute: 38, context: "after_meal", chance: 0.88 },
  { hour: 21, minute: 15, context: "social", weekend: true, chance: 0.65 },
  { hour: 21, minute: 48, context: "night", weekday: true, chance: 0.5 },
  { hour: 22, minute: 20, context: "night", weekend: true, chance: 0.55 },
  { hour: 22, minute: 55, context: "social", weekend: true, chance: 0.4 },
];

const BRANDS = ["Marlboro Gold", "Camel Blue", "Lucky Strike", "Parliament"];

export function createSampleMonth(now = Date.now()): {
  logs: SmokeLog[];
  purchases: Purchase[];
  spans: DaySpan[];
} {
  const rand = mulberry32(20260904);
  const logs: SmokeLog[] = [];

  for (let offset = 34; offset >= 0; offset -= 1) {
    const day = startOfDay(subDays(now, offset));
    const weekday = day.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    for (const slot of SLOTS) {
      if (slot.weekend && !isWeekend) continue;
      if (slot.weekday && isWeekend) continue;
      if (rand() > slot.chance) continue;
      const jitter = Math.floor(rand() * 18) - 8;
      const at = stamp(day, slot.hour, Math.max(0, Math.min(59, slot.minute + jitter)));
      if (at > now - 20 * 60_000) continue;
      logs.push({ id: uid(), at, context: slot.context });
    }
  }

  logs.sort((a, b) => a.at - b.at);

  const cigsPerPack = 20;
  const leftover = 11;
  const packsNeeded = Math.ceil((logs.length + leftover) / cigsPerPack);
  const span = 34;
  const purchases: Purchase[] = [];

  for (let i = 0; i < packsNeeded; i += 1) {
    const dayOffset = Math.round((i / Math.max(packsNeeded - 1, 1)) * (span - 1));
    const day = startOfDay(subDays(now, span - dayOffset));
    const at = stamp(day, 9 + Math.floor(rand() * 8), Math.floor(rand() * 50));
    const cost = Math.round((11.4 + rand() * 3.2) * 100) / 100;
    purchases.push({
      id: uid(),
      at: Math.min(at, now - 60_000),
      brand: BRANDS[i % BRANDS.length] ?? "Cigarettes",
      packs: 1,
      cigsPerPack,
      cost,
    });
  }

  purchases.sort((a, b) => a.at - b.at);

  const spans: DaySpan[] = [];
  for (let offset = 34; offset >= 0; offset -= 1) {
    const day = startOfDay(subDays(now, offset));
    const weekday = day.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const prev = startOfDay(subDays(now, offset + 1));

    const sleepStart = stamp(prev, isWeekend ? 23 : 22, 40 + Math.floor(rand() * 25));
    const sleepEnd = stamp(day, isWeekend ? 8 : 6, 40 + Math.floor(rand() * 35));
    if (sleepEnd < now - 10 * 60_000) {
      spans.push({ id: uid(), kind: "sleep", start: sleepStart, end: sleepEnd });
    }

    const meals: [number, number, number, number][] = isWeekend
      ? [
          [9, 10, 9, 45],
          [13, 5, 13, 50],
          [19, 20, 20, 5],
        ]
      : [
          [7, 40, 8, 5],
          [12, 20, 12, 55],
          [19, 5, 19, 40],
        ];
    for (const [sh, sm, eh, em] of meals) {
      const start = stamp(day, sh, sm + Math.floor(rand() * 8) - 3);
      const end = stamp(day, eh, em + Math.floor(rand() * 8) - 3);
      if (end <= start || end > now - 5 * 60_000) continue;
      if (rand() > 0.92) continue;
      spans.push({ id: uid(), kind: "meal", start, end });
    }

    if (!isWeekend && rand() < 0.7) {
      const start = stamp(day, 10, 40 + Math.floor(rand() * 30));
      const end = start + (35 + Math.floor(rand() * 40)) * 60_000;
      if (end < now - 5 * 60_000) {
        spans.push({ id: uid(), kind: "meeting", start, end });
      }
    }
    if (!isWeekend) {
      const c1s = stamp(day, 8, 35 + Math.floor(rand() * 12));
      const c1e = stamp(day, 9, 10 + Math.floor(rand() * 15));
      if (c1e < now - 5 * 60_000) {
        spans.push({ id: uid(), kind: "commute", start: c1s, end: c1e });
      }
      const c2s = stamp(day, 17, 35 + Math.floor(rand() * 15));
      const c2e = stamp(day, 18, 15 + Math.floor(rand() * 20));
      if (c2e < now - 5 * 60_000) {
        spans.push({ id: uid(), kind: "commute", start: c2s, end: c2e });
      }
    }

    if (isWeekend && rand() < 0.4) {
      const start = stamp(day, 10, 5 + Math.floor(rand() * 20));
      const end = start + (50 + Math.floor(rand() * 25)) * 60_000;
      if (end < now - 5 * 60_000) {
        spans.push({ id: uid(), kind: "gym", start, end });
      }
    }
  }

  spans.sort((a, b) => a.start - b.start);
  return { logs, purchases, spans };
}
