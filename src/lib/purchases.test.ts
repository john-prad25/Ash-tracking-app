import assert from "node:assert/strict";
import test from "node:test";
import { lineCost, purchaseLinesCost } from "./purchases.ts";
import type { Settings } from "./types.ts";

const settings: Settings = {
  currency: "INR",
  cigsPerPack: 20,
  defaultPackCost: 480,
  minutesPerCig: 6,
};

test("lineCost scales from settings per-cigarette price", () => {
  assert.equal(lineCost({ packs: 1, cigsPerPack: 20 }, settings), 480);
  assert.equal(lineCost({ packs: 1, cigsPerPack: 10 }, settings), 240);
  assert.equal(lineCost({ packs: 2, cigsPerPack: 10 }, settings), 480);
});

test("purchaseLinesCost sums multiple pack lines", () => {
  const total = purchaseLinesCost(
    [{ packs: 1, cigsPerPack: 20 }, { packs: 1, cigsPerPack: 10 }],
    settings,
  );
  assert.equal(total, 720);
});
