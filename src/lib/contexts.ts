import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  CalendarCheck,
  CalendarClock,
  CarFront,
  CircleDashed,
  Coffee,
  Flame,
  Moon,
  Pause,
  Sunrise,
  Users,
  Utensils,
  UtensilsCrossed,
  Wind,
} from "lucide-react";
import type { ContextGroup, ContextId, CustomContext } from "./types";

export interface ContextDef {
  id: string;
  label: string;
  short: string;
  group: ContextGroup;
  icon: LucideIcon;
  builtIn: boolean;
}

export const CONTEXTS: ContextDef[] = [
  { id: "before_meal", label: "Before a meal", short: "Meal", group: "before", icon: UtensilsCrossed, builtIn: true },
  { id: "before_meeting", label: "Before a meeting", short: "Meeting", group: "before", icon: CalendarClock, builtIn: true },
  { id: "morning", label: "Morning", short: "Morning", group: "before", icon: Sunrise, builtIn: true },
  { id: "commute", label: "Commute", short: "Commute", group: "before", icon: CarFront, builtIn: true },
  { id: "after_meal", label: "After a meal", short: "Meal", group: "after", icon: Utensils, builtIn: true },
  { id: "after_meeting", label: "After a meeting", short: "Meeting", group: "after", icon: CalendarCheck, builtIn: true },
  { id: "night", label: "Night", short: "Night", group: "after", icon: Moon, builtIn: true },
  { id: "social", label: "Social", short: "Social", group: "around", icon: Users, builtIn: true },
  { id: "coffee", label: "With a drink", short: "Drink", group: "around", icon: Coffee, builtIn: true },
  { id: "work_break", label: "Work break", short: "Work", group: "around", icon: Briefcase, builtIn: true },
  { id: "stress", label: "Stress", short: "Stress", group: "around", icon: Wind, builtIn: true },
  { id: "boredom", label: "Boredom", short: "Boredom", group: "around", icon: Pause, builtIn: true },
  { id: "craving", label: "Craving", short: "Craving", group: "around", icon: Flame, builtIn: true },
  { id: "other", label: "Other", short: "Other", group: "around", icon: CircleDashed, builtIn: true },
];

export const CONTEXT_BY_ID: Record<ContextId, ContextDef> = Object.fromEntries(
  CONTEXTS.map((c) => [c.id, c]),
) as Record<ContextId, ContextDef>;

export const GROUP_META: Record<ContextGroup, { label: string; hint: string }> = {
  before: { label: "Before", hint: "The run-up" },
  after: { label: "After", hint: "The come-down" },
  around: { label: "Around", hint: "Alongside the day" },
};

export const GROUP_ORDER: ContextGroup[] = ["before", "after", "around"];

export function getContextDef(id: string, customContexts: CustomContext[] = []): ContextDef {
  const builtIn = CONTEXT_BY_ID[id as ContextId];
  if (builtIn) return builtIn;
  const custom = customContexts.find((c) => c.id === id);
  if (custom) {
    return {
      id: custom.id,
      label: custom.label,
      short: custom.label,
      group: custom.group,
      icon: CircleDashed,
      builtIn: false,
    };
  }
  return CONTEXT_BY_ID.other;
}
