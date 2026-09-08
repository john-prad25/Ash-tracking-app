import type { Purchase, PurchaseLine, Settings } from "./types";

export function purchaseTotalCigs(purchase: Purchase): number {
  return purchase.lines.reduce((sum, line) => sum + line.packs * line.cigsPerPack, 0);
}

export function totalPurchasedCigs(purchases: Purchase[]): number {
  return purchases.reduce((sum, p) => sum + purchaseTotalCigs(p), 0);
}

export function perCigarettePrice(settings: Settings): number {
  return settings.cigsPerPack > 0 ? settings.defaultPackCost / settings.cigsPerPack : 0;
}

export function lineCost(line: PurchaseLine, settings: Settings): number {
  const per = perCigarettePrice(settings);
  return Math.round(per * line.packs * line.cigsPerPack * 100) / 100;
}

export function purchaseLinesCost(lines: PurchaseLine[], settings: Settings): number {
  const total = lines.reduce((sum, line) => sum + lineCost(line, settings), 0);
  return Math.round(total * 100) / 100;
}

/** Migrate legacy purchases that used flat packs/cigsPerPack fields. */
export function normalizePurchase(raw: Purchase & { packs?: number; cigsPerPack?: number }): Purchase {
  if (Array.isArray(raw.lines) && raw.lines.length > 0) {
    return { id: raw.id, at: raw.at, brand: raw.brand, lines: raw.lines, cost: raw.cost };
  }
  return {
    id: raw.id,
    at: raw.at,
    brand: raw.brand,
    lines: [{ packs: raw.packs ?? 1, cigsPerPack: raw.cigsPerPack ?? 20 }],
    cost: raw.cost,
  };
}
