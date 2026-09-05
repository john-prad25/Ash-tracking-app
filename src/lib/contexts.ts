import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  CalendarCheck,
  CalendarClock,
  CarFront,
  CircleDashed,
  Coffee,
  Moon,
  Pause,
  Sunrise,
  Users,
  Utensils,
  UtensilsCrossed,
  Wind,
} from "lucide-react";
import type { ContextGroup, ContextId } from "./types";

export interface ContextDef {
  id: ContextId;
  label: string;
  short: string;
  group: ContextGroup;
  icon: LucideIcon;
}

export const CONTEXTS: ContextDef[] = [
  { id: "before_meal", label: "Before a meal", short: "Meal", group: "before", icon: UtensilsCrossed },
  { id: "before_meeting", label: "Before a meeting", short: "Meeting", group: "before", icon: CalendarClock },
  { id: "morning", label: "Morning", short: "Morning", group: "before", icon: Sunrise },
  { id: "commute", label: "Commute", short: "Commute", group: "before", icon: CarFront },
  { id: "after_meal", label: "After a meal", short: "Meal", group: "after", icon: Utensils },
  { id: "after_meeting", label: "After a meeting", short: "Meeting", group: "after", icon: CalendarCheck },
  { id: "night", label: "Night", short: "Night", group: "after", icon: Moon },
  { id: "social", label: "Social", short: "Social", group: "around", icon: Users },
  { id: "coffee", label: "With a drink", short: "Drink", group: "around", icon: Coffee },
  { id: "work_break", label: "Work break", short: "Work", group: "around", icon: Briefcase },
  { id: "stress", label: "Stress", short: "Stress", group: "around", icon: Wind },
  { id: "boredom", label: "Boredom", short: "Boredom", group: "around", icon: Pause },
  { id: "other", label: "Other", short: "Other", group: "around", icon: CircleDashed },
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
