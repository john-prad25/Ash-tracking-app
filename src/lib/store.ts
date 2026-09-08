import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { normalizePurchase, perCigarettePrice } from "./purchases";
import { createSampleMonth } from "./seed";
import type {
  ContextGroup,
  CustomContext,
  GiveAwayLog,
  LoosePurchaseLog,
  Purchase,
  PurchaseInput,
  Settings,
  SmokeLog,
  TakenLog,
} from "./types";
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
  giveAways: GiveAwayLog[];
  taken: TakenLog[];
  loosePurchases: LoosePurchaseLog[];
  customContexts: CustomContext[];
  settings: Settings;
  initialized: boolean;
  isSample: boolean;
  ensureSeeded: () => void;
  addSmoke: (context: string) => SmokeLog;
  restoreSmoke: (log: SmokeLog) => void;
  undoSmoke: (id: string) => void;
  addGiveAway: (count: number) => GiveAwayLog;
  undoGiveAway: (id: string) => void;
  restoreGiveAway: (entry: GiveAwayLog) => void;
  addTaken: (count: number) => TakenLog;
  undoTaken: (id: string) => void;
  restoreTaken: (entry: TakenLog) => void;
  addLoosePurchase: (count: number) => LoosePurchaseLog;
  undoLoosePurchase: (id: string) => void;
  restoreLoosePurchase: (entry: LoosePurchaseLog) => void;
  addCustomContext: (group: ContextGroup, label: string) => CustomContext;
  removeCustomContext: (id: string) => void;
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

function normalizePurchases(raw: Purchase[]): Purchase[] {
  return raw.map((p) => normalizePurchase(p as Purchase & { packs?: number; cigsPerPack?: number }));
}

export const useAshStore = create<AshState>()(
  persist(
    (set, get) => ({
      logs: [],
      purchases: [],
      giveAways: [],
      taken: [],
      loosePurchases: [],
      customContexts: [],
      settings: DEFAULT_SETTINGS,
      initialized: false,
      isSample: false,
      ensureSeeded: () => {
        if (get().initialized) return;
        const sample = createSampleMonth();
        set({
          logs: sample.logs,
          purchases: sample.purchases,
          initialized: true,
          isSample: true,
        });
      },
      addSmoke: (context) => {
        const log: SmokeLog = { id: uid(), at: Date.now(), context };
        set((s) => ({ logs: [...s.logs, log] }));
        return log;
      },
      restoreSmoke: (log) => {
        set((s) => (s.logs.some((l) => l.id === log.id) ? s : { logs: [...s.logs, log] }));
      },
      undoSmoke: (id) => {
        set((s) => ({ logs: s.logs.filter((l) => l.id !== id) }));
      },
      addGiveAway: (count) => {
        const entry: GiveAwayLog = { id: uid(), at: Date.now(), count: Math.max(1, count) };
        set((s) => ({ giveAways: [...s.giveAways, entry] }));
        return entry;
      },
      undoGiveAway: (id) => {
        set((s) => ({ giveAways: s.giveAways.filter((g) => g.id !== id) }));
      },
      restoreGiveAway: (entry) => {
        set((s) =>
          s.giveAways.some((g) => g.id === entry.id) ? s : { giveAways: [...s.giveAways, entry] },
        );
      },
      addTaken: (count) => {
        const entry: TakenLog = { id: uid(), at: Date.now(), count: Math.max(1, count) };
        set((s) => ({ taken: [...s.taken, entry] }));
        return entry;
      },
      undoTaken: (id) => {
        set((s) => ({ taken: s.taken.filter((t) => t.id !== id) }));
      },
      restoreTaken: (entry) => {
        set((s) => (s.taken.some((t) => t.id === entry.id) ? s : { taken: [...s.taken, entry] }));
      },
      addLoosePurchase: (count) => {
        const n = Math.max(1, count);
        const per = perCigarettePrice(get().settings);
        const entry: LoosePurchaseLog = {
          id: uid(),
          at: Date.now(),
          count: n,
          cost: Math.round(per * n * 100) / 100,
        };
        set((s) => ({ loosePurchases: [...s.loosePurchases, entry] }));
        return entry;
      },
      undoLoosePurchase: (id) => {
        set((s) => ({ loosePurchases: s.loosePurchases.filter((l) => l.id !== id) }));
      },
      restoreLoosePurchase: (entry) => {
        set((s) =>
          s.loosePurchases.some((l) => l.id === entry.id)
            ? s
            : { loosePurchases: [...s.loosePurchases, entry] },
        );
      },
      addCustomContext: (group, label) => {
        const trimmed = label.trim();
        const custom: CustomContext = { id: `custom_${uid()}`, label: trimmed, group };
        set((s) => ({ customContexts: [...s.customContexts, custom] }));
        return custom;
      },
      removeCustomContext: (id) => {
        set((s) => ({ customContexts: s.customContexts.filter((c) => c.id !== id) }));
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
          giveAways: [],
          taken: [],
          loosePurchases: [],
          customContexts: [],
          initialized: true,
          isSample: false,
        }),
      loadSample: () => {
        const sample = createSampleMonth();
        set({
          logs: sample.logs,
          purchases: sample.purchases,
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
        const p = (persisted ?? {}) as Partial<AshState> & {
          purchases?: (Purchase & { packs?: number; cigsPerPack?: number })[];
        };
        return {
          ...current,
          ...p,
          purchases: Array.isArray(p.purchases) ? normalizePurchases(p.purchases) : [],
          giveAways: Array.isArray(p.giveAways) ? p.giveAways : [],
          taken: Array.isArray(p.taken) ? p.taken : [],
          loosePurchases: Array.isArray(p.loosePurchases) ? p.loosePurchases : [],
          customContexts: Array.isArray(p.customContexts) ? p.customContexts : [],
        };
      },
      partialize: (s) => ({
        logs: s.logs,
        purchases: s.purchases,
        giveAways: s.giveAways,
        taken: s.taken,
        loosePurchases: s.loosePurchases,
        customContexts: s.customContexts,
        settings: s.settings,
        initialized: s.initialized,
        isSample: s.isSample,
      }),
    },
  ),
);
