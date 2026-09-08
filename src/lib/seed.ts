import { setHours, setMinutes, startOfDay, subDays } from "date-fns";
import type { ContextId, Purchase, SmokeLog } from "./types";
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
      lines: [{ packs: 1, cigsPerPack }],
      cost,
    });
  }

  purchases.sort((a, b) => a.at - b.at);
  return { logs, purchases };
}
