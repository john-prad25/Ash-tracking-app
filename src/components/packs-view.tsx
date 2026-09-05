import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
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
import { costPerCigarette, inventoryRemaining } from "@/lib/stats";
import { useAshStore } from "@/lib/store";

export function PacksView() {
  const purchases = useAshStore((s) => s.purchases);
  const logs = useAshStore((s) => s.logs);
  const settings = useAshStore((s) => s.settings);
  const deletePurchase = useAshStore((s) => s.deletePurchase);

  const ordered = useMemo(
    () => purchases.slice().sort((a, b) => b.at - a.at),
    [purchases],
  );

  const remaining = inventoryRemaining(logs, purchases);
  const perCig = costPerCigarette(
    purchases,
    settings.cigsPerPack > 0 ? settings.defaultPackCost / settings.cigsPerPack : 0,
  );
  const totalSpent = purchases.reduce((s, p) => s + p.cost, 0);
  const totalCigs = purchases.reduce((s, p) => s + p.packs * p.cigsPerPack, 0);

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
          {ordered.map((p) => (
            <li key={p.id}>
              <Card className="flex items-center gap-3 p-3 sm:p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.brand || "Unlabeled pack"}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(p.at, "d MMM yyyy")} · {p.packs} {plural(p.packs, "pack")} ·{" "}
                    {p.packs * p.cigsPerPack} sticks
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
          ))}
        </ul>
      )}
    </div>
  );
}

function AddPurchaseDialog() {
  const settings = useAshStore((s) => s.settings);
  const addPurchase = useAshStore((s) => s.addPurchase);
  const [open, setOpen] = useState(false);
  const [brand, setBrand] = useState("");
  const [packs, setPacks] = useState("1");
  const [cigs, setCigs] = useState(String(settings.cigsPerPack));
  const [cost, setCost] = useState(String(settings.defaultPackCost));
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  function reset() {
    setBrand("");
    setPacks("1");
    setCigs(String(settings.cigsPerPack));
    setCost(String(settings.defaultPackCost));
    setDate(format(new Date(), "yyyy-MM-dd"));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const packCount = Math.max(1, Number(packs) || 1);
    const per = Math.max(1, Number(cigs) || settings.cigsPerPack);
    const total = Number(cost);
    if (!Number.isFinite(total) || total <= 0) {
      toast("Enter a cost greater than zero");
      return;
    }
    const at = new Date(`${date}T12:00:00`).getTime();
    addPurchase({
      at: Number.isFinite(at) ? at : Date.now(),
      brand: brand.trim(),
      packs: packCount,
      cigsPerPack: per,
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
            <DialogDescription>A pack, a carton, or a loose handful.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Field label="Brand">
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Optional" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Packs">
                <Input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={packs}
                  onChange={(e) => setPacks(e.target.value)}
                />
              </Field>
              <Field label="Sticks per pack">
                <Input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={cigs}
                  onChange={(e) => setCigs(e.target.value)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={`Cost (${settings.currency})`}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </Field>
              <Field label="Date">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </Field>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save purchase</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
