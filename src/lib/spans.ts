import {
  Briefcase,
  CalendarClock,
  CarFront,
  CircleDashed,
  Dumbbell,
  Moon,
  Plane,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DaySpan, SmokeLog, SpanKind } from "./types";

export const SPAN_KINDS: SpanKind[] = [
  "commute",
  "sleep",
  "meal",
  "meeting",
  "work",
  "gym",
  "flight",
  "other",
];

export const SPAN_META: Record<
  SpanKind,
  { label: string; start: string; end: string; hint: string; icon: LucideIcon }
> = {
  commute: {
    label: "Commute",
    start: "Start commute",
    end: "End commute",
    hint: "On the way",
    icon: CarFront,
  },
  sleep: {
    label: "Sleep",
    start: "Start sleep",
    end: "End sleep",
    hint: "Lights out",
    icon: Moon,
  },
  meal: {
    label: "Meal",
    start: "Start meal",
    end: "End meal",
    hint: "At the table",
    icon: Utensils,
  },
  meeting: {
    label: "Meeting",
    start: "Start meeting",
    end: "End meeting",
    hint: "In the room",
    icon: CalendarClock,
  },
  work: {
    label: "Work",
    start: "Start work",
    end: "End work",
    hint: "At the desk",
    icon: Briefcase,
  },
  gym: {
    label: "Gym",
    start: "Start gym",
    end: "End gym",
    hint: "In session",
    icon: Dumbbell,
  },
  flight: {
    label: "Flight",
    start: "Start flight",
    end: "End flight",
    hint: "In the air",
    icon: Plane,
  },
  other: {
    label: "Other",
    start: "Start block",
    end: "End block",
    hint: "No smoking",
    icon: CircleDashed,
  },
};

export function spansCovering(spans: DaySpan[], at: number, now = Date.now()) {
  return spans.filter((s) => at >= s.start && at <= (s.end ?? now));
}

export function openSpan(spans: DaySpan[]) {
  return spans.find((s) => s.end === null) ?? null;
}

export function runningSpan(spans: DaySpan[], kind: SpanKind) {
  return spans.find((s) => s.kind === kind && s.end === null) ?? null;
}

export function overlapMs(
  start: number,
  end: number,
  rangeStart: number,
  rangeEnd: number,
) {
  const a = Math.max(start, rangeStart);
  const b = Math.min(end, rangeEnd);
  return Math.max(0, b - a);
}

export function spanMsInRange(span: DaySpan, rangeStart: Date, rangeEnd: Date, now: number) {
  return overlapMs(
    span.start,
    span.end ?? now,
    rangeStart.getTime(),
    rangeEnd.getTime(),
  );
}

export interface SpanKindSummary {
  kind: SpanKind;
  label: string;
  minutes: number;
  count: number;
  smokes: number;
}

export function summarizeSpans(
  spans: DaySpan[],
  logs: SmokeLog[],
  rangeStart: Date,
  rangeEnd: Date,
  now = Date.now(),
): SpanKindSummary[] {
  const rs = rangeStart.getTime();
  const re = rangeEnd.getTime();
  return SPAN_KINDS.map((kind) => {
    const ofKind = spans.filter((s) => s.kind === kind);
    const minutes = ofKind.reduce((sum, s) => sum + spanMsInRange(s, rangeStart, rangeEnd, now), 0) / 60_000;
    const count = ofKind.filter((s) => {
      const end = s.end ?? now;
      return end >= rs && s.start <= re;
    }).length;
    const smokes = logs.filter((l) => {
      if (l.at < rs || l.at > re) return false;
      return ofKind.some((s) => l.at >= s.start && l.at <= (s.end ?? now));
    }).length;
    return { kind, label: SPAN_META[kind].label, minutes, count, smokes };
  });
}

export function activeSpanSummary(
  spans: DaySpan[],
  logs: SmokeLog[],
  rangeStart: Date,
  rangeEnd: Date,
  now = Date.now(),
) {
  return summarizeSpans(spans, logs, rangeStart, rangeEnd, now)
    .filter((row) => row.minutes > 0 || row.count > 0)
    .sort((a, b) => b.minutes - a.minutes);
}
