/**
 * Skeletons mirror the exact geometry of what replaces them, so nothing
 * reflows on load. Shimmer is slow enough to read as material, not as a spinner.
 */
export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-[2px] bg-hairline/70 ${className}`}
      style={{ animationDuration: "1.6s" }}
    />
  );
}

export function EntryRowSkeleton() {
  return (
    <div className="flex gap-5 border-b border-hairline bg-surface px-6 py-6">
      <div className="w-[3px] shrink-0 rounded-full bg-hairline" />
      <div className="flex-1 space-y-3">
        <Shimmer className="h-3 w-24" />
        <Shimmer className="h-6 w-40" />
        <Shimmer className="h-4 w-64" />
      </div>
    </div>
  );
}

export function EntryListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div
      className="overflow-hidden rounded-[6px] border border-hairline shadow-rest"
      aria-busy="true"
      aria-label="Loading entries"
    >
      {Array.from({ length: rows }, (_, i) => (
        <EntryRowSkeleton key={i} />
      ))}
    </div>
  );
}
