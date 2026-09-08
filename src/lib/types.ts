export type ContextId =
  | "before_meal"
  | "after_meal"
  | "before_meeting"
  | "after_meeting"
  | "morning"
  | "night"
  | "commute"
  | "social"
  | "coffee"
  | "work_break"
  | "stress"
  | "boredom"
  | "craving"
  | "other";

export type ContextGroup = "before" | "after" | "around";

export type Currency = "USD" | "EUR" | "GBP" | "INR";

export type Period = "day" | "week" | "month";

export interface CustomContext {
  id: string;
  label: string;
  group: ContextGroup;
}

export interface SmokeLog {
  id: string;
  at: number;
  context: string;
}

export interface GiveAwayLog {
  id: string;
  at: number;
  count: number;
}

export interface TakenLog {
  id: string;
  at: number;
  count: number;
}

export interface LoosePurchaseLog {
  id: string;
  at: number;
  count: number;
  cost: number;
}

export interface PurchaseLine {
  packs: number;
  cigsPerPack: number;
}

export interface Purchase {
  id: string;
  at: number;
  brand: string;
  lines: PurchaseLine[];
  cost: number;
}

export interface Settings {
  currency: Currency;
  cigsPerPack: number;
  defaultPackCost: number;
  minutesPerCig: number;
}

export interface PurchaseInput {
  at: number;
  brand: string;
  lines: PurchaseLine[];
  cost: number;
}
