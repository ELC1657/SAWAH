import Link from "next/link";
import { EditorBadge } from "./EditorBadge";
import { RegionMark } from "./RegionMark";
import type { EntryCard } from "@/types/database";

/**
 * The dialect colour is a rule down the leading edge, not decoration around
 * the content. On hover the rule thickens and the row picks up a wash of its
 * own region colour, so scanning a mixed list stays legible by dialect.
 */
export function EntryRow({ entry }: { entry: EntryCard }) {
  return (
    <Link
      href={`/entry/${entry.id}`}
      className="group relative flex gap-5 border-b border-hairline bg-surface px-6 py-6 transition-colors duration-150 last:border-b-0 hover:bg-[color-mix(in_oklab,var(--region)_5%,var(--color-surface))]"
      style={{ "--region": entry.region_color } as React.CSSProperties}
    >
      <span
        aria-hidden="true"
        className="mt-1 w-[3px] shrink-0 origin-top transition-[width,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-[5px]"
        style={{ backgroundColor: entry.region_color }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-4">
          <RegionMark name={entry.region_name} color={entry.region_color} />
          {entry.part_of_speech ? (
            <span className="font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
              {entry.part_of_speech}
            </span>
          ) : null}
        </div>

        <h3 className="mt-2.5 flex items-center gap-2 font-display text-[26px] font-normal leading-[1.15] tracking-[-0.015em] text-ink">
          <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[length:100%_1px]">
            {entry.term}
          </span>
          {entry.editor_checked ? (
            <EditorBadge />
          ) : null}
        </h3>

        <p className="mt-1 text-[16px] leading-snug text-ink-soft">
          {entry.gloss}
          {entry.gloss_secondary ? (
            <span className="text-faint"> &middot; {entry.gloss_secondary}</span>
          ) : null}
        </p>

        {entry.example_term ? (
          <p className="mt-3 border-l border-hairline pl-3 text-[14px] italic leading-relaxed text-muted">
            {entry.example_term}
            {entry.example_gloss ? (
              <span className="not-italic text-faint"> · {entry.example_gloss}</span>
            ) : null}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
