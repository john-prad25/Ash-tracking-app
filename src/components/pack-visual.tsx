import { plural } from "@/lib/format";
import { cn } from "@/lib/utils";

export function PackVisual({
  openPackRemaining,
  openPackCapacity,
  sealedCigarettes,
  remaining,
}: {
  openPackRemaining: number;
  openPackCapacity: number;
  sealedCigarettes: number;
  remaining: number;
}) {
  const slots = Math.min(Math.max(openPackCapacity, 1), 30);
  const filled = openPackRemaining <= 0 ? 0 : Math.min(openPackRemaining, slots);

  let caption: string;
  if (remaining < 0) {
    caption = `${Math.abs(remaining)} smoked past logged packs`;
  } else if (remaining === 0) {
    caption = "Pack empty — log a purchase";
  } else if (sealedCigarettes > 0) {
    caption = `${sealedCigarettes} sealed + ${openPackRemaining} in open pack`;
  } else if (openPackRemaining <= openPackCapacity) {
    caption = `${openPackRemaining} left in open pack`;
  } else {
    caption = `${remaining} remaining`;
  }

  const columns = Math.min(slots, 10);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
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
