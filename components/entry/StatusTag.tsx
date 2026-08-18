import type { EntryStatus } from "@/types/database";

const COPY: Record<EntryStatus, { label: string; className: string }> = {
  pending: { label: "Live, unverified", className: "text-muted" },
  verified: { label: "Verified", className: "text-seal" },
  rejected: { label: "Removed", className: "text-danger" },
};

/** Status is set in mono micro type, the same register as dialect labels. */
export function StatusTag({ status }: { status: EntryStatus }) {
  const { label, className } = COPY[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.09em] ${className}`}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current"
        style={{ opacity: status === "pending" ? 0.5 : 1 }}
      />
      {label}
    </span>
  );
}
