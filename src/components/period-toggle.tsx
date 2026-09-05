import { cn } from "@/lib/utils";
import type { Period } from "@/lib/types";

const OPTIONS: { id: Period; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

export function PeriodToggle({
  value,
  onChange,
}: {
  value: Period;
  onChange: (period: Period) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl bg-secondary p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "h-9 rounded-lg text-sm font-medium transition-[background-color,color] duration-150",
            value === opt.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
