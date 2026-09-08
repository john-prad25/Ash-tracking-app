import { endOfDay, isSameDay, startOfDay } from "date-fns";
import { Gift, HandCoins, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PackVisual } from "@/components/pack-visual";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONTEXTS, getContextDef, GROUP_META, GROUP_ORDER } from "@/lib/contexts";
import { formatMoney, formatRelativeAgo, formatTime, plural } from "@/lib/format";
import { inRange, inventoryRemaining, openPackState } from "@/lib/stats";
import { useAshStore } from "@/lib/store";
import type {
  ContextGroup,
  CustomContext,
  GiveAwayLog,
  LoosePurchaseLog,
  SmokeLog,
  TakenLog,
} from "@/lib/types";
import { cn } from "@/lib/utils";

function useNow(ms = 60_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

type TodayEntry =
  | { kind: "smoke"; entry: SmokeLog }
  | { kind: "give"; entry: GiveAwayLog }
  | { kind: "taken"; entry: TakenLog }
  | { kind: "loose"; entry: LoosePurchaseLog };

export function TodayView() {
  const logs = useAshStore((s) => s.logs);
  const purchases = useAshStore((s) => s.purchases);
  const giveAways = useAshStore((s) => s.giveAways);
  const taken = useAshStore((s) => s.taken);
  const loosePurchases = useAshStore((s) => s.loosePurchases);
  const customContexts = useAshStore((s) => s.customContexts);
  const settings = useAshStore((s) => s.settings);
  const addSmoke = useAshStore((s) => s.addSmoke);
  const undoSmoke = useAshStore((s) => s.undoSmoke);
  const restoreSmoke = useAshStore((s) => s.restoreSmoke);
  const addGiveAway = useAshStore((s) => s.addGiveAway);
  const undoGiveAway = useAshStore((s) => s.undoGiveAway);
  const restoreGiveAway = useAshStore((s) => s.restoreGiveAway);
  const addTaken = useAshStore((s) => s.addTaken);
  const undoTaken = useAshStore((s) => s.undoTaken);
  const restoreTaken = useAshStore((s) => s.restoreTaken);
  const addLoosePurchase = useAshStore((s) => s.addLoosePurchase);
  const undoLoosePurchase = useAshStore((s) => s.undoLoosePurchase);
  const restoreLoosePurchase = useAshStore((s) => s.restoreLoosePurchase);
  const addCustomContext = useAshStore((s) => s.addCustomContext);
  const removeCustomContext = useAshStore((s) => s.removeCustomContext);
  const minuteNow = useNow();

  const todayEntries = useMemo(() => {
    const start = startOfDay(minuteNow);
    const end = endOfDay(minuteNow);
    const items: TodayEntry[] = [
      ...logs
        .filter((l) => inRange(l.at, start, end))
        .map((entry) => ({ kind: "smoke" as const, entry })),
      ...giveAways
        .filter((g) => inRange(g.at, start, end))
        .map((entry) => ({ kind: "give" as const, entry })),
      ...taken
        .filter((t) => inRange(t.at, start, end))
        .map((entry) => ({ kind: "taken" as const, entry })),
      ...loosePurchases
        .filter((l) => inRange(l.at, start, end))
        .map((entry) => ({ kind: "loose" as const, entry })),
    ];
    return items.sort((a, b) => b.entry.at - a.entry.at);
  }, [logs, giveAways, taken, loosePurchases, minuteNow]);

  const todaySmokes = todayEntries.filter((e) => e.kind === "smoke");

  const last = useMemo(
    () => logs.slice().sort((a, b) => b.at - a.at)[0],
    [logs],
  );

  const remaining = inventoryRemaining(logs, purchases, giveAways, taken, loosePurchases);
  const pack = openPackState(
    logs,
    purchases,
    giveAways,
    taken,
    loosePurchases,
    settings.cigsPerPack,
  );
  const minutesToday = todaySmokes.length * settings.minutesPerCig;

  function log(context: string) {
    const entry = addSmoke(context);
    const def = getContextDef(context, customContexts);
    toast(`Logged ${def.label.toLowerCase()}`, {
      action: {
        label: "Undo",
        onClick: () => undoSmoke(entry.id),
      },
    });
  }

  function removeSmoke(entry: SmokeLog) {
    undoSmoke(entry.id);
    toast("Removed from today’s log", {
      action: {
        label: "Undo",
        onClick: () => restoreSmoke(entry),
      },
    });
  }

  function removeTaken(entry: TakenLog) {
    undoTaken(entry.id);
    toast("Removed from today’s log", {
      action: {
        label: "Undo",
        onClick: () => restoreTaken(entry),
      },
    });
  }

  function removeLoose(entry: LoosePurchaseLog) {
    undoLoosePurchase(entry.id);
    toast("Removed from today’s log", {
      action: {
        label: "Undo",
        onClick: () => restoreLoosePurchase(entry),
      },
    });
  }

  function removeGiveAway(entry: GiveAwayLog) {
    undoGiveAway(entry.id);
    toast("Removed from today’s log", {
      action: {
        label: "Undo",
        onClick: () => restoreGiveAway(entry),
      },
    });
  }

  const remainingLabel =
    remaining < 0 ? `${Math.abs(remaining)} smoked past logged packs` : `${remaining} remaining`;

  return (
    <div className="flex flex-col gap-6">
      <section className="stagger-in grid grid-cols-2 gap-3">
        <Card className="col-span-2 sm:col-span-1">
          <p className="text-xs font-medium text-muted-foreground">Today</p>
          <p className="mt-2 font-display text-5xl leading-none tracking-tight tabular-nums">
            {todaySmokes.length}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {plural(todaySmokes.length, "cigarette")} · {minutesToday}m
          </p>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <p className="text-xs font-medium text-muted-foreground">Since the last</p>
          <p className="mt-2 font-display text-3xl leading-tight tracking-tight">
            {last ? formatRelativeAgo(last.at, minuteNow) : "—"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {last ? getContextDef(last.context, customContexts).label : "Nothing logged yet"}
          </p>
        </Card>
      </section>

      <section className="stagger-in" style={{ animationDelay: "80ms" }}>
        <div className="mb-3">
          <h2 className="text-sm font-medium">Log one</h2>
          <p className="text-xs text-muted-foreground">Tap the moment. You can undo.</p>
        </div>
        <div className="flex flex-col gap-4">
          {GROUP_ORDER.map((group) => (
            <ContextGroupBlock
              key={group}
              group={group}
              customContexts={customContexts}
              onLog={log}
              onAddCustom={(label) => addCustomContext(group, label)}
              onRemoveCustom={removeCustomContext}
            />
          ))}
        </div>
      </section>

      <Card className="stagger-in" style={{ animationDelay: "120ms" }}>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-medium">Open pack</h2>
          <p className="text-xs tabular-nums text-muted-foreground">{remainingLabel}</p>
        </div>
        <PackVisual
          openPackRemaining={pack.openPackRemaining}
          openPackCapacity={pack.openPackCapacity}
          sealedCigarettes={pack.sealedCigarettes}
          remaining={pack.remaining}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <AddCigarettesDialog />
          <GiveAwayDialog />
        </div>
      </Card>

      <section className="stagger-in pb-4" style={{ animationDelay: "160ms" }}>
        <h2 className="mb-3 text-sm font-medium">Today’s log</h2>
        {todayEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Empty so far. The first tap starts the day.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {todayEntries.map((item) => {
              if (item.kind === "give") {
                const entry = item.entry;
                return (
                  <li
                    key={entry.id}
                    className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-secondary"
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <Gift className="size-4" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">Given away</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {plural(entry.count, "cigarette")} ·{" "}
                        {isSameDay(entry.at, minuteNow)
                          ? formatTime(entry.at)
                          : formatRelativeAgo(entry.at, minuteNow)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="relative size-11 text-muted-foreground hover:text-foreground"
                      onClick={() => removeGiveAway(entry)}
                      aria-label="Remove"
                    >
                      <Trash2 className="mx-auto size-4" />
                    </button>
                  </li>
                );
              }
              if (item.kind === "taken") {
                const entry = item.entry;
                return (
                  <li
                    key={entry.id}
                    className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-secondary"
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <Plus className="size-4" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">Taken</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {plural(entry.count, "cigarette")} ·{" "}
                        {isSameDay(entry.at, minuteNow)
                          ? formatTime(entry.at)
                          : formatRelativeAgo(entry.at, minuteNow)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="relative size-11 text-muted-foreground hover:text-foreground"
                      onClick={() => removeTaken(entry)}
                      aria-label="Remove"
                    >
                      <Trash2 className="mx-auto size-4" />
                    </button>
                  </li>
                );
              }
              if (item.kind === "loose") {
                const entry = item.entry;
                return (
                  <li
                    key={entry.id}
                    className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-secondary"
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <HandCoins className="size-4" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">Loose purchase</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {plural(entry.count, "cigarette")} · {formatMoney(entry.cost, settings.currency)} ·{" "}
                        {isSameDay(entry.at, minuteNow)
                          ? formatTime(entry.at)
                          : formatRelativeAgo(entry.at, minuteNow)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="relative size-11 text-muted-foreground hover:text-foreground"
                      onClick={() => removeLoose(entry)}
                      aria-label="Remove"
                    >
                      <Trash2 className="mx-auto size-4" />
                    </button>
                  </li>
                );
              }
              const logEntry = item.entry;
              const def = getContextDef(logEntry.context, customContexts);
              const Icon = def.icon;
              return (
                <li
                  key={logEntry.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-secondary"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{def.label}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {isSameDay(logEntry.at, minuteNow)
                        ? formatTime(logEntry.at)
                        : formatRelativeAgo(logEntry.at, minuteNow)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="relative size-11 text-muted-foreground hover:text-foreground"
                    onClick={() => removeSmoke(logEntry)}
                    aria-label="Remove"
                  >
                    <Trash2 className="mx-auto size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function ContextGroupBlock({
  group,
  customContexts,
  onLog,
  onAddCustom,
  onRemoveCustom,
}: {
  group: ContextGroup;
  customContexts: CustomContext[];
  onLog: (id: string) => void;
  onAddCustom: (label: string) => void;
  onRemoveCustom: (id: string) => void;
}) {
  const meta = GROUP_META[group];
  const builtIn = CONTEXTS.filter((c) => c.group === group);
  const custom = customContexts.filter((c) => c.group === group);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");

  function submitCustom(e: FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    onAddCustom(trimmed);
    setLabel("");
    setAdding(false);
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {meta.label}
        </p>
        <p className="text-xs text-muted-foreground">{meta.hint}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {builtIn.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onLog(item.id)}
              className={cn(
                "press-scale flex min-h-11 items-center gap-2.5 rounded-xl bg-card px-3 py-2.5 text-left shadow-[var(--shadow-border)] transition-[box-shadow,background-color] duration-150",
                "hover:shadow-[var(--shadow-border-hover)] hover:bg-accent",
              )}
              aria-label={item.label}
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <span className="text-sm leading-tight">{item.short}</span>
            </button>
          );
        })}
        {custom.map((item) => (
          <div key={item.id} className="relative">
            <button
              type="button"
              onClick={() => onLog(item.id)}
              className={cn(
                "press-scale flex min-h-11 w-full items-center gap-2.5 rounded-xl bg-card px-3 py-2.5 text-left shadow-[var(--shadow-border)] transition-[box-shadow,background-color] duration-150",
                "hover:shadow-[var(--shadow-border-hover)] hover:bg-accent",
              )}
              aria-label={item.label}
            >
              <span className="text-sm leading-tight">{item.label}</span>
            </button>
            <button
              type="button"
              className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-secondary text-[10px] text-muted-foreground hover:text-foreground"
              onClick={() => onRemoveCustom(item.id)}
              aria-label={`Remove ${item.label}`}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={cn(
            "press-scale flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-transparent px-3 py-2.5 text-muted-foreground transition-colors duration-150",
            "hover:bg-accent hover:text-foreground",
          )}
        >
          <Plus className="size-4" />
          <span className="text-sm">Add</span>
        </button>
      </div>
      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <form onSubmit={submitCustom} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Add option</DialogTitle>
              <DialogDescription>
                A custom moment under {meta.label.toLowerCase()}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-1.5">
              <Label htmlFor={`custom-${group}`}>Label</Label>
              <Input
                id={`custom-${group}`}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. After gym"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!label.trim()}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddCigarettesDialog() {
  const settings = useAshStore((s) => s.settings);
  const addTaken = useAshStore((s) => s.addTaken);
  const undoTaken = useAshStore((s) => s.undoTaken);
  const addLoosePurchase = useAshStore((s) => s.addLoosePurchase);
  const undoLoosePurchase = useAshStore((s) => s.undoLoosePurchase);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"pick" | "taken" | "loose">("pick");
  const [count, setCount] = useState("1");

  const perCig =
    settings.cigsPerPack > 0 ? settings.defaultPackCost / settings.cigsPerPack : 0;
  const n = Math.max(1, Number(count) || 1);
  const looseCost = Math.round(perCig * n * 100) / 100;

  function reset() {
    setMode("pick");
    setCount("1");
  }

  function close() {
    setOpen(false);
    reset();
  }

  function submitTaken(e: FormEvent) {
    e.preventDefault();
    const entry = addTaken(n);
    toast(`Logged ${plural(n, "cigarette")} taken`, {
      action: {
        label: "Undo",
        onClick: () => undoTaken(entry.id),
      },
    });
    close();
  }

  function submitLoose(e: FormEvent) {
    e.preventDefault();
    const entry = addLoosePurchase(n);
    toast(`Logged ${plural(n, "cigarette")} loose · ${formatMoney(entry.cost, settings.currency)}`, {
      action: {
        label: "Undo",
        onClick: () => undoLoosePurchase(entry.id),
      },
    });
    close();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Add
      </Button>
      <DialogContent>
        {mode === "pick" ? (
          <div className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Add cigarettes</DialogTitle>
              <DialogDescription>
                From someone else, or bought loose one at a time.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={() => setMode("taken")}>
                <Plus className="size-4" />
                Taken
              </Button>
              <Button type="button" variant="outline" onClick={() => setMode("loose")}>
                <HandCoins className="size-4" />
                Loose purchase
              </Button>
            </div>
          </div>
        ) : mode === "taken" ? (
          <form onSubmit={submitTaken} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Taken</DialogTitle>
              <DialogDescription>
                Cigarettes from someone else. No cost is added.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-1.5">
              <Label htmlFor="taken-count">Cigarettes</Label>
              <Input
                id="taken-count"
                type="number"
                min={1}
                inputMode="numeric"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter className="gap-2 sm:justify-between">
              <Button type="button" variant="ghost" onClick={() => setMode("pick")}>
                Back
              </Button>
              <Button type="submit">Log</Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={submitLoose} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Loose purchase</DialogTitle>
              <DialogDescription>
                Single sticks bought loose. Cost is calculated from settings.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-1.5">
              <Label htmlFor="loose-count">Cigarettes</Label>
              <Input
                id="loose-count"
                type="number"
                min={1}
                inputMode="numeric"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                {formatMoney(looseCost, settings.currency)} at {formatMoney(perCig, settings.currency)} each
              </p>
            </div>
            <DialogFooter className="gap-2 sm:justify-between">
              <Button type="button" variant="ghost" onClick={() => setMode("pick")}>
                Back
              </Button>
              <Button type="submit">Log</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GiveAwayDialog() {
  const addGiveAway = useAshStore((s) => s.addGiveAway);
  const undoGiveAway = useAshStore((s) => s.undoGiveAway);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState("1");

  function submit(e: FormEvent) {
    e.preventDefault();
    const n = Math.max(1, Number(count) || 1);
    const entry = addGiveAway(n);
    toast(`Logged ${plural(n, "cigarette")} given away`, {
      action: {
        label: "Undo",
        onClick: () => undoGiveAway(entry.id),
      },
    });
    setCount("1");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Minus className="size-4" />
        Given away
      </Button>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Given to someone</DialogTitle>
            <DialogDescription>
              Reduce the open pack count when you hand cigarettes to someone else.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="give-count">Cigarettes</Label>
            <Input
              id="give-count"
              type="number"
              min={1}
              inputMode="numeric"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Log</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
