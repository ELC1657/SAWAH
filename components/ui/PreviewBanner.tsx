/**
 * Only rendered while no Supabase project is connected. Exists so preview
 * content can never be mistaken for entries people actually submitted.
 */
export function PreviewBanner() {
  return (
    <div className="border-b border-hairline bg-paper-sunk">
      <div className="mx-auto flex w-full max-w-[1120px] items-center gap-3 px-6 py-2">
        <span className="h-1.5 w-1.5 shrink-0 bg-[#B8862F]" aria-hidden="true" />
        <p className="font-mono text-[11px] uppercase tracking-[0.09em] text-muted">
          Local preview
        </p>
        <p className="text-[12px] leading-snug text-faint">
          Sample content for testing layout. The dialect tags are unverified and
          nothing here is stored in the database.
        </p>
      </div>
    </div>
  );
}
