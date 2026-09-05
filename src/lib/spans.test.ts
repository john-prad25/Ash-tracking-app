import assert from "node:assert/strict";
import test from "node:test";
import {
  openSpan,
  openSpans,
  runningSpan,
  spansCovering,
  toggleSpanKind,
  undoSpanSwitchState,
  undoSpanToggleState,
} from "./spans.ts";
import type { DaySpan } from "./types.ts";

function span(partial: Partial<DaySpan> & Pick<DaySpan, "id" | "kind">): DaySpan {
  return {
    start: 1_000,
    end: null,
    ...partial,
  };
}

test("toggleSpanKind starts a kind without closing a different open kind", () => {
  const work = toggleSpanKind([], "work", 1_000, "work-1");
  assert.equal(work.action, "start");
  const both = toggleSpanKind(work.spans, "meeting", 2_000, "meet-1");
  assert.equal(both.action, "start");
  assert.equal(openSpans(both.spans).length, 2);
  assert.ok(runningSpan(both.spans, "work"));
  assert.ok(runningSpan(both.spans, "meeting"));
});

test("toggleSpanKind only ends the matching kind", () => {
  const started = toggleSpanKind([], "work", 1_000, "work-1");
  const both = toggleSpanKind(started.spans, "meeting", 2_000, "meet-1");
  const ended = toggleSpanKind(both.spans, "work", 3_000, "unused");
  assert.equal(ended.action, "end");
  assert.equal(runningSpan(ended.spans, "work"), null);
  assert.ok(runningSpan(ended.spans, "meeting"));
});

test("only one span per kind may be open", () => {
  const first = toggleSpanKind([], "work", 1_000, "work-1");
  const again = toggleSpanKind(first.spans, "work", 2_000, "work-2");
  assert.equal(again.action, "end");
  assert.equal(again.spans.length, 1);
  assert.equal(again.spans[0]!.end, 2_000);
});

test("undo of a start removes the span; undo of an end reopens that kind", () => {
  const started = toggleSpanKind([], "gym", 1_000, "gym-1");
  const afterUndoStart = undoSpanToggleState(started.spans, "gym-1");
  assert.equal(afterUndoStart.length, 0);

  const ended = toggleSpanKind(started.spans, "gym", 5_000, "unused");
  const reopened = undoSpanToggleState(ended.spans, "gym-1");
  assert.equal(reopened[0]!.end, null);
});

test("undo of an end does not reopen if that kind is already open", () => {
  const first = span({ id: "old", kind: "work", start: 1_000, end: 2_000 });
  const live = span({ id: "new", kind: "work", start: 3_000, end: null });
  const next = undoSpanToggleState([first, live], "old");
  assert.equal(next.some((s) => s.id === "old"), false);
  assert.ok(runningSpan(next, "work"));
});

test("undoSpanSwitch restores the previous kind only if that kind is not open", () => {
  const previous = span({ id: "work-1", kind: "work", start: 1_000, end: 2_000 });
  const started = span({ id: "meet-1", kind: "meeting", start: 2_000, end: null });
  const restored = undoSpanSwitchState([previous, started], "meet-1", "work-1");
  assert.equal(restored.length, 1);
  assert.equal(restored[0]!.id, "work-1");
  assert.equal(restored[0]!.end, null);
});

test("spansCovering returns every overlapping kind, not just one", () => {
  const spans: DaySpan[] = [
    span({ id: "w", kind: "work", start: 1_000, end: 5_000 }),
    span({ id: "m", kind: "meeting", start: 2_000, end: 4_000 }),
  ];
  const covering = spansCovering(spans, 3_000);
  assert.equal(covering.length, 2);
});

test("openSpan without a kind is any open span; with a kind it is per-kind", () => {
  const spans: DaySpan[] = [
    span({ id: "w", kind: "work", start: 1_000, end: null }),
    span({ id: "m", kind: "meeting", start: 2_000, end: null }),
  ];
  assert.ok(openSpan(spans));
  assert.equal(openSpan(spans, "work")?.id, "w");
  assert.equal(openSpan(spans, "gym"), null);
});
