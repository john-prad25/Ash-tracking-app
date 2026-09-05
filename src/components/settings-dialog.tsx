import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Currency } from "@/lib/types";
import { useAshStore } from "@/lib/store";

export function SettingsDialog() {
  const settings = useAshStore((s) => s.settings);
  const updateSettings = useAshStore((s) => s.updateSettings);
  const startFresh = useAshStore((s) => s.startFresh);
  const loadSample = useAshStore((s) => s.loadSample);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="size-5" strokeWidth={1.75} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Defaults for cost, time, and pack size.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Currency</Label>
            <Select
              value={settings.currency}
              onValueChange={(v) => updateSettings({ currency: v as Currency })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">US dollar</SelectItem>
                <SelectItem value="EUR">Euro</SelectItem>
                <SelectItem value="GBP">Pound sterling</SelectItem>
                <SelectItem value="INR">Indian rupee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Sticks per pack</Label>
              <Input
                type="number"
                min={1}
                value={settings.cigsPerPack}
                onChange={(e) =>
                  updateSettings({ cigsPerPack: Math.max(1, Number(e.target.value) || 1) })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Default pack cost</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={settings.defaultPackCost}
                onChange={(e) =>
                  updateSettings({ defaultPackCost: Math.max(0, Number(e.target.value) || 0) })
                }
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Minutes per cigarette</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={settings.minutesPerCig}
              onChange={(e) =>
                updateSettings({ minutesPerCig: Math.max(1, Number(e.target.value) || 6) })
              }
            />
            <p className="text-xs text-muted-foreground">
              Used to estimate time spent. Six minutes is a typical stick.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => loadSample()}>
              Load sample month
            </Button>
            <Button type="button" variant="ghost" onClick={() => startFresh()}>
              Start with an empty ledger
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
