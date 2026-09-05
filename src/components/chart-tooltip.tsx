export function ChartTooltip({
  active,
  payload,
  label,
  suffix = "",
}: {
  active?: boolean;
  payload?: { value?: number | string }[];
  label?: string | number;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-popover px-3 py-2 text-xs shadow-[var(--shadow-border)]">
      {label !== undefined && <p className="text-muted-foreground">{label}</p>}
      <p className="font-medium tabular-nums text-foreground">
        {payload[0]?.value}
        {suffix}
      </p>
    </div>
  );
}
