import assert from "node:assert/strict";
import test from "node:test";
import { endOfMonth, startOfMonth } from "date-fns";
import {
  assignSmokeCosts,
  inventoryRemaining,
  openPackState,
  periodRange,
  previousRange,
  summarizeRange,
} from "./stats.ts";
import type { GiveAwayLog, LoosePurchaseLog, Purchase, Settings, SmokeLog, TakenLog } from "./types.ts";

const settings: Settings = {
  currency: "USD",
  cigsPerPack: 20,
  defaultPackCost: 10,
  minutesPerCig: 6,
};

function log(id: string, at: Date): SmokeLog {
  return { id, at: at.getTime(), context: "other" };
}

function pack(id: string, at: Date, cost = 20, cigs = 20, packs = 1): Purchase {
  return { id, at: at.getTime(), brand: "Test", lines: [{ packs, cigsPerPack: cigs }], cost };
}

function give(id: string, at: Date, count = 1): GiveAwayLog {
  return { id, at: at.getTime(), count };
}

function taken(id: string, at: Date, count = 1): TakenLog {
  return { id, at: at.getTime(), count };
}

function loose(id: string, at: Date, count = 1, cost = 0.5): LoosePurchaseLog {
  return { id, at: at.getTime(), count, cost };
}

test("periodRange day is the calendar day of the anchor", () => {
  const { start, end } = periodRange("day", new Date(2026, 2, 15, 18, 30));
  assert.equal(start.getFullYear(), 2026);
  assert.equal(start.getMonth(), 2);
  assert.equal(start.getDate(), 15);
  assert.equal(start.getHours(), 0);
  assert.equal(end.getDate(), 15);
  assert.ok(end.getTime() > start.getTime());
});

test("previousRange week is the prior Mon–Sun week, not a millisecond slide", () => {
  const week = periodRange("week", new Date(2026, 2, 11));
  assert.equal(week.start.getDate(), 9);
  const prev = previousRange("week", week.start);
  assert.equal(prev.start.getFullYear(), 2026);
  assert.equal(prev.start.getMonth(), 2);
  assert.equal(prev.start.getDate(), 2);
  assert.equal(prev.end.getDate(), 8);
});

test("periodRange month is the calendar month of the anchor", () => {
  const { start, end } = periodRange("month", new Date(2026, 2, 15));
  assert.equal(start.getTime(), startOfMonth(new Date(2026, 2, 1)).getTime());
  assert.equal(end.getTime(), endOfMonth(new Date(2026, 2, 1)).getTime());
});

test("previousRange for March is February, not a 31-day slide into January", () => {
  const march = periodRange("month", new Date(2026, 2, 31));
  const prev = previousRange("month", march.start);
  assert.equal(prev.start.getFullYear(), 2026);
  assert.equal(prev.start.getMonth(), 1);
  assert.equal(prev.start.getDate(), 1);
  assert.equal(prev.end.getMonth(), 1);
  assert.equal(prev.end.getDate(), 28);
});

test("summarizeRange March vs February is calendar-correct (regression for spanMs slide)", () => {
  const march = periodRange("month", new Date(2026, 2, 15));
  const logs = [
    log("jan30", new Date(2026, 0, 30, 12)),
    log("feb15", new Date(2026, 1, 15, 12)),
    log("mar10", new Date(2026, 2, 10, 12)),
  ];
  const summary = summarizeRange(logs, [], [], [], [], [], settings, march.start, march.end, "month");
  assert.equal(summary.count, 1);
  assert.equal(summary.prevCount, 1);

  const oldPrevStart = new Date(march.start.getTime() - (march.end.getTime() - march.start.getTime()) - 1);
  const oldPrevEnd = new Date(march.start.getTime() - 1);
  const oldPrevCount = logs.filter((l) => l.at >= oldPrevStart.getTime() && l.at <= oldPrevEnd.getTime()).length;
  assert.equal(oldPrevCount, 2, "old implementation counted January 30 as previous");
  assert.notEqual(summary.prevCount, oldPrevCount);
});

test("assignSmokeCosts ignores packs bought after the cigarette (FIFO date guard)", () => {
  const purchases = [pack("later", new Date(2026, 0, 20, 12), 40)];
  const logs = [
    log("early", new Date(2026, 0, 1, 12)),
    log("after", new Date(2026, 0, 21, 12)),
  ];
  const map = assignSmokeCosts(logs, purchases, [], [], [], 0.5);
  assert.equal(map.get("early"), 0.5);
  assert.equal(map.get("after"), 2);
});

test("assignSmokeCosts uses zero cost for taken cigarettes", () => {
  const logs = [log("smoke", new Date(2026, 0, 2, 12))];
  const takenLogs = [taken("t", new Date(2026, 0, 1, 12), 2)];
  const map = assignSmokeCosts(logs, [], [], takenLogs, [], 0.5);
  assert.equal(map.get("smoke"), 0);
});

test("inventoryRemaining adds taken and loose, subtracts smokes and give-aways", () => {
  const logs = [log("a", new Date(2026, 0, 2)), log("b", new Date(2026, 0, 3))];
  const purchases = [pack("p", new Date(2026, 0, 1), 10, 20, 1)];
  const giveAways = [give("g", new Date(2026, 0, 4), 3)];
  const takenLogs = [taken("t", new Date(2026, 0, 5), 4)];
  const looseLogs = [loose("l", new Date(2026, 0, 6), 2, 1)];
  assert.equal(inventoryRemaining(logs, purchases), 18);
  assert.equal(inventoryRemaining(logs, purchases, giveAways), 15);
  assert.equal(inventoryRemaining(logs, purchases, giveAways, takenLogs), 19);
  assert.equal(inventoryRemaining(logs, purchases, giveAways, takenLogs, looseLogs), 21);
  assert.equal(inventoryRemaining(logs, []), -2);
  assert.equal(inventoryRemaining([], []), 0);
});

test("openPackState treats multi-line purchase as one open pack", () => {
  const purchases: Purchase[] = [
    {
      id: "combo",
      at: new Date(2026, 0, 1).getTime(),
      brand: "Combo",
      lines: [{ packs: 1, cigsPerPack: 20 }, { packs: 1, cigsPerPack: 10 }],
      cost: 30,
    },
  ];
  const logs = [log("a", new Date(2026, 0, 2))];
  const state = openPackState(logs, purchases, [], [], [], 20);
  assert.equal(state.openPackCapacity, 30);
  assert.equal(state.openPackRemaining, 29);
  assert.equal(state.remaining, 29);
});

test("openPackState includes taken cigarettes in remaining", () => {
  const takenLogs = [taken("t", new Date(2026, 0, 1), 3)];
  const state = openPackState([], [], [], takenLogs, [], 20);
  assert.equal(state.remaining, 3);
  assert.equal(state.openPackRemaining, 3);
});
