import { plural } from "@/lib/format";
import { cn } from "@/lib/utils";

export function PackVisual({
  remaining,
  perPack,
}: {
  remaining: number;
  perPack: number;
}) {
  const slots = Math.min(Math.max(perPack, 1), 25);
  const filled = remaining <= 0 ? 0 : Math.min(remaining, slots);
  const packs = Math.floor(Math.max(remaining, 0) / perPack);
  const loose = Math.max(remaining, 0) % perPack;

  let caption: string;
  if (remaining < 0) {
    caption = `${Math.abs(remaining)} smoked past logged packs`;
  } else if (remaining === 0) {
    caption = "Pack empty — log a purchase";
  } else if (remaining <= perPack) {
    caption = `${remaining} left in this pack`;
  } else if (loose === 0) {
    caption = `${packs} full ${plural(packs, "pack")} on hand`;
  } else {
    caption = `${packs} ${plural(packs, "pack")} + ${loose} in the open one`;
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${Math.min(slots, 10)}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: slots }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-3 rounded-sm transition-colors duration-200",
              i < filled ? "bg-primary" : "bg-secondary",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}