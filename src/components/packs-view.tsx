import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney, plural } from "@/lib/format";
import { lineCost, purchaseLinesCost, purchaseTotalCigs, totalPurchasedCigs } from "@/lib/purchases";
import { costPerCigarette, inventoryRemaining } from "@/lib/stats";
import { useAshStore } from "@/lib/store";
import type { PurchaseLine } from "@/lib/types";

export function PacksView() {
  const purchases = useAshStore((s) => s.purchases);
  const logs = useAshStore((s) => s.logs);
  const giveAways = useAshStore((s) => s.giveAways);
  const settings = useAshStore((s) => s.settings);
  const deletePurchase = useAshStore((s) => s.deletePurchase);

  const ordered = useMemo(
    () => purchases.slice().sort((a, b) => b.at - a.at),
    [purchases],
  );

  const remaining = inventoryRemaining(logs, purchases, giveAways);
  const perCig = costPerCigarette(
    purchases,
    settings.cigsPerPack > 0 ? settings.defaultPackCost / settings.cigsPerPack : 0,
  );
  const totalSpent = purchases.reduce((s, p) => s + p.cost, 0);
  const totalCigs = totalPurchasedCigs(purchases);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-tight">Purchases</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            What you bought, and what each stick costs.
          </p>
        </div>
        <AddPurchaseDialog />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs font-medium text-muted-foreground">On hand</p>
          <p className="mt-2 font-display text-3xl leading-none tabular-nums">{remaining}</p>
          <p className="mt-2 text-xs text-muted-foreground">{plural(Math.abs(remaining), "cigarette")}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-muted-foreground">Per cigarette</p>
          <p className="mt-2 font-display text-3xl leading-none tabular-nums">
            {formatMoney(perCig, settings.currency)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Weighted across packs</p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-muted-foreground">Logged spend</p>
          <p className="mt-2 font-display text-2xl leading-none tabular-nums">
            {formatMoney(totalSpent, settings.currency)}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium text-muted-foreground">Bought</p>
          <p className="mt-2 font-display text-2xl leading-none tabular-nums">{totalCigs}</p>
          <p className="mt-2 text-xs text-muted-foreground">{plural(totalCigs, "stick")}</p>
        </Card>
      </div>

      {ordered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No purchases yet. Log a pack to start costing each cigarette.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {ordered.map((p) => {
            const sticks = purchaseTotalCigs(p);
            const packDesc = p.lines
              .map((l) => `${l.packs}×${l.cigsPerPack}`)
              .join(" + ");
            return (
              <li key={p.id}>
                <Card className="flex items-center gap-3 p-3 sm:p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.brand || "Unlabeled pack"}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(p.at, "d MMM yyyy")} · {packDesc} · {sticks} sticks
                    </p>
                  </div>
                  <p className="text-sm tabular-nums">{formatMoney(p.cost, settings.currency)}</p>
                  <button
                    type="button"
                    className="relative size-11 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      deletePurchase(p.id);
                      toast("Purchase removed");
                    }}
                    aria-label="Remove purchase"
                  >
                    <Trash2 className="mx-auto size-4" />
                  </button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

interface LineDraft {
  packs: string;
  cigs: string;
}

function defaultLine(settings: { cigsPerPack: number }): LineDraft {
  return { packs: "1", cigs: String(settings.cigsPerPack) };
}

function AddPurchaseDialog() {
  const settings = useAshStore((s) => s.settings);
  const addPurchase = useAshStore((s) => s.addPurchase);
  const [open, setOpen] = useState(false);
  const [brand, setBrand] = useState("");
  const [lines, setLines] = useState<LineDraft[]>(() => [defaultLine(settings)]);
  const [cost, setCost] = useState(String(settings.defaultPackCost));
  const [costManual, setCostManual] = useState(false);
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  const parsedLines = useMemo((): PurchaseLine[] => {
    return lines.map((line) => ({
      packs: Math.max(1, Number(line.packs) || 1),
      cigsPerPack: Math.max(1, Number(line.cigs) || settings.cigsPerPack),
    }));
  }, [lines, settings.cigsPerPack]);

  const suggestedCost = useMemo(
    () => purchaseLinesCost(parsedLines, settings),
    [parsedLines, settings],
  );

  useEffect(() => {
    if (!costManual) {
      setCost(String(suggestedCost));
    }
  }, [suggestedCost, costManual]);

  function reset() {
    setBrand("");
    setLines([defaultLine(settings)]);
    setCost(String(settings.defaultPackCost));
    setCostManual(false);
    setDate(format(new Date(), "yyyy-MM-dd"));
  }

  function updateLine(index: number, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
    setCostManual(false);
  }

  function addLine() {
    setLines((prev) => [...prev, defaultLine(settings)]);
    setCostManual(false);
  }

  function removeLine(index: number) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
    setCostManual(false);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const total = Number(cost);
    if (!Number.isFinite(total) || total <= 0) {
      toast("Enter a cost greater than zero");
      return;
    }
    const at = new Date(`${date}T12:00:00`).getTime();
    addPurchase({
      at: Number.isFinite(at) ? at : Date.now(),
      brand: brand.trim(),
      lines: parsedLines,
      cost: total,
    });
    toast("Purchase logged");
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Log a purchase</DialogTitle>
            <DialogDescription>
              Multiple pack sizes bought together count as one open pack.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Field label="Brand">
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Optional" />
            </Field>
            <div className="grid gap-2">
              <Label>Pack lines</Label>
              {lines.map((line, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Field label={index === 0 ? "Packs" : undefined}>
                    <Input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={line.packs}
                      onChange={(e) => updateLine(index, { packs: e.target.value })}
                    />
                  </Field>
                  <Field label={index === 0 ? "Sticks per pack" : undefined}>
                    <Input
                      type="number"
                      min={1}
                      inputMode="numeric"
                      value={line.cigs}
                      onChange={(e) => updateLine(index, { cigs: e.target.value })}
                    />
                  </Field>
                  {lines.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-6"
                      onClick={() => removeLine(index)}
                      aria-label="Remove line"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : (
                    <span />
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="size-4" />
                Add another pack size
              </Button>
              {lines.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  {parsedLines.reduce((s, l) => s + l.packs * l.cigsPerPack, 0)} sticks total · counted as one open pack
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={`Cost (${settings.currency})`}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={cost}
                  onChange={(e) => {
                    setCost(e.target.value);
                    setCostManual(true);
                  }}
                />
              </Field>
              <Field label="Date">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
            </div>
            {!costManual && parsedLines.length === 1 && (
              <p className="text-xs text-muted-foreground">
                {formatMoney(lineCost(parsedLines[0]!, settings), settings.currency)} from settings
                ({formatMoney(settings.defaultPackCost / settings.cigsPerPack, settings.currency)}/stick)
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Save purchase</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      {label ? <Label>{label}</Label> : null}
      {children}
    </div>
  );
}
