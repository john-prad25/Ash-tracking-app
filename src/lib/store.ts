import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createSampleMonth } from "./seed";
import { openSpan } from "./spans";
import type { ContextId, DaySpan, Purchase, PurchaseInput, Settings, SmokeLog, SpanKind } from "./types";
import { uid } from "./utils";

const DEFAULT_SETTINGS: Settings = {
  currency: "USD",
  cigsPerPack: 20,
  defaultPackCost: 12.5,
  minutesPerCig: 6,
};

export interface AshState {
  logs: SmokeLog[];
  purchases: Purchase[];
  spans: DaySpan[];
  settings: Settings;
  initialized: boolean;
  isSample: boolean;
  ensureSeeded: () => void;
  addSmoke: (context: ContextId) => SmokeLog;
  undoSmoke: (id: string) => void;
  deleteSmoke: (id: string) => void;
  toggleSpan: (
    kind: SpanKind,
  ) => { action: "start" | "end" | "switch"; span: DaySpan; previous?: DaySpan };
  undoSpanToggle: (id: string) => void;
  undoSpanSwitch: (startedId: string, previousId: string) => void;
  deleteSpan: (id: string) => void;
  addPurchase: (input: PurchaseInput) => Purchase;
  deletePurchase: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  dismissSample: () => void;
  startFresh: () => void;
  loadSample: () => void;
}

const emptyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useAshStore = create<AshState>()(
  persist(
    (set, get) => ({
      logs: [],
      purchases: [],
      spans: [],
      settings: DEFAULT_SETTINGS,
      initialized: false,
      isSample: false,
      ensureSeeded: () => {
        if (get().initialized) {
          if (get().isSample && get().spans.length === 0) {
            set({ spans: createSampleMonth().spans });
          }
          return;
        }
        const sample = createSampleMonth();
        set({
          logs: sample.logs,
          purchases: sample.purchases,
          spans: sample.spans,
          initialized: true,
          isSample: true,
        });
      },
      addSmoke: (context) => {
        const log: SmokeLog = { id: uid(), at: Date.now(), context };
        set((s) => ({ logs: [...s.logs, log] }));
        return log;
      },
      undoSmoke: (id) => {
        set((s) => ({ logs: s.logs.filter((l) => l.id !== id) }));
      },
      deleteSmoke: (id) => {
        set((s) => ({ logs: s.logs.filter((l) => l.id !== id) }));
      },
      toggleSpan: (kind) => {
        const open = openSpan(get().spans);
        if (open && open.kind === kind) {
          const span: DaySpan = { ...open, end: Date.now() };
          set((s) => ({
            spans: s.spans.map((x) => (x.id === open.id ? span : x)),
          }));
          return { action: "end" as const, span };
        }
        if (open) {
          const previous: DaySpan = { ...open, end: Date.now() };
          const span: DaySpan = { id: uid(), kind, start: Date.now(), end: null };
          set((s) => ({
            spans: [...s.spans.map((x) => (x.id === open.id ? previous : x)), span],
          }));
          return { action: "switch" as const, span, previous };
        }
        const span: DaySpan = { id: uid(), kind, start: Date.now(), end: null };
        set((s) => ({ spans: [...s.spans, span] }));
        return { action: "start" as const, span };
      },
      undoSpanToggle: (id) => {
        set((s) => {
          const found = s.spans.find((x) => x.id === id);
          if (!found) return s;
          if (found.end === null) {
            return { spans: s.spans.filter((x) => x.id !== id) };
          }
          const alreadyOpen = s.spans.some((x) => x.end === null);
          if (alreadyOpen) {
            return { spans: s.spans.filter((x) => x.id !== id) };
          }
          return { spans: s.spans.map((x) => (x.id === id ? { ...x, end: null } : x)) };
        });
      },
      undoSpanSwitch: (startedId, previousId) => {
        set((s) => ({
          spans: s.spans
            .filter((x) => x.id !== startedId)
            .map((x) => (x.id === previousId ? { ...x, end: null } : x)),
        }));
      },
      deleteSpan: (id) => {
        set((s) => ({ spans: s.spans.filter((x) => x.id !== id) }));
      },
      addPurchase: (input) => {
        const purchase: Purchase = { id: uid(), ...input };
        set((s) => ({ purchases: [...s.purchases, purchase] }));
        return purchase;
      },
      deletePurchase: (id) => {
        set((s) => ({ purchases: s.purchases.filter((p) => p.id !== id) }));
      },
      updateSettings: (patch) => {
        set((s) => ({ settings: { ...s.settings, ...patch } }));
      },
      dismissSample: () => set({ isSample: false }),
      startFresh: () =>
        set({
          logs: [],
          purchases: [],
          spans: [],
          initialized: true,
          isSample: false,
        }),
      loadSample: () => {
        const sample = createSampleMonth();
        set({
          logs: sample.logs,
          purchases: sample.purchases,
          spans: sample.spans,
          initialized: true,
          isSample: true,
        });
      },
    }),
    {
      name: "ash-ledger-v1",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? emptyStorage : localStorage,
      ),
      skipHydration: true,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AshState>;
        return {
          ...current,
          ...p,
          spans: Array.isArray(p.spans) ? p.spans : [],
        };
      },
      partialize: (s) => ({
        logs: s.logs,
        purchases: s.purchases,
        spans: s.spans,
        settings: s.settings,
        initialized: s.initialized,
        isSample: s.isSample,
      }),
    },
  ),
);
