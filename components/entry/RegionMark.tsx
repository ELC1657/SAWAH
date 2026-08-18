/**
 * A dialect is not a gray pill. It is a colour the entry carries, a mono label
 * in that colour, and a square that reads as a map key rather than a badge.
 */
export function RegionMark({
  name,
  color,
  size = "sm",
}: {
  name: string;
  color: string;
  size?: "sm" | "lg";
}) {
  return (
    <span
      className="inline-flex items-center gap-2 region-text"
      style={{ "--region": color } as React.CSSProperties}
    >
      <span
        aria-hidden="true"
        className={size === "lg" ? "h-2.5 w-2.5" : "h-2 w-2"}
        style={{ backgroundColor: color }}
      />
      <span
        className={
          size === "lg"
            ? "font-mono text-[12px] font-medium uppercase tracking-[0.11em]"
            : "font-mono text-[11px] font-medium uppercase tracking-[0.11em]"
        }
      >
        {name}
      </span>
    </span>
  );
}
