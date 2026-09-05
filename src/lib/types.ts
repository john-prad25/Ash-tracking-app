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
  | "other";

export type ContextGroup = "before" | "after" | "around";

export type Currency = "USD" | "EUR" | "GBP" | "INR";

export type Period = "day" | "week" | "month";

export type SpanKind =
  | "commute"
  | "sleep"
  | "meal"
  | "meeting"
  | "work"
  | "gym"
  | "flight"
  | "other";

export interface SmokeLog {
  id: string;
  at: number;
  context: ContextId;
}

export interface DaySpan {
  id: string;
  kind: SpanKind;
  start: number;
  end: number | null;
}

export interface Purchase {
  id: string;
  at: number;
  brand: string;
  packs: number;
  cigsPerPack: number;
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
  packs: number;
  cigsPerPack: number;
  cost: number;
}
