import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_DICTIONARY } from "@/lib/constants";
import { EntryList } from "@/components/entry/EntryList";
import { DialectBrowser } from "@/components/map/DialectBrowser";
import { REGIONS, REGION_BY_SLUG } from "@/lib/regions";
import { isPreviewMode, PREVIEW_ENTRIES } from "@/lib/preview";
import type { DialectKeyItem, EntryCard } from "@/types/database";

function previewKey(): DialectKeyItem[] {
  return REGIONS.map((r) => ({
    region_slug: r.slug,
    region_name: r.name,
    region_area: r.area,
    region_color: r.color,
    entry_count: PREVIEW_ENTRIES.filter((e) => e.region_slug === r.slug).length,
  }));
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ dialect?: string }>;
}) {
  const { dialect } = await searchParams;
  const selected = dialect && REGION_BY_SLUG.has(dialect) ? dialect : null;

  const supabase = await createClient();
  const [{ data: counts }, { data: entries }] = await Promise.all([
    supabase.rpc("region_counts", { dict: DEFAULT_DICTIONARY }),
    supabase.rpc("search_entries", {
      dict: DEFAULT_DICTIONARY,
      region_slugs: selected ? [selected] : null,
      lim: 30,
    }),
  ]);

  const fetchedKey = (counts ?? []) as DialectKeyItem[];
  const dialectKey = isPreviewMode
    ? previewKey()
    : fetchedKey.length > 0
      ? fetchedKey
      : previewKey().map((r) => ({ ...r, entry_count: 0 }));

  const allRows = isPreviewMode ? PREVIEW_ENTRIES : ((entries ?? []) as EntryCard[]);
  const rows = isPreviewMode && selected
    ? allRows.filter((e) => e.region_slug === selected)
    : allRows;

  const total = dialectKey.reduce((sum, r) => sum + Number(r.entry_count), 0);
  const activeRegion = selected ? REGION_BY_SLUG.get(selected)! : null;

  return (
    <>
      {/* Front matter, at reading size. A reference work says what it is and
          then shows you the entries. */}
      <section className="py-10">
        <h1 className="font-mono text-[12px] uppercase tracking-[0.14em] text-faint">
          Sasak to English dictionary
        </h1>
        <p className="mt-4 max-w-[62ch] text-[16px] leading-relaxed text-ink-soft">
          Sasak has five dialects and no standard spelling. Every word here was
          submitted by someone who speaks it and tagged with the dialect it came
          from. Entries an editor has checked carry a seal.
        </p>
        <p className="numeric-tabular mt-5 font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
          {total} {total === 1 ? "entry" : "entries"}
          <span className="mx-2 text-hairline-strong">/</span>
          Lombok
          <span className="mx-2 text-hairline-strong">/</span>
          <Link
            href="/submit"
            className="underline decoration-hairline-strong underline-offset-[3px] transition-colors duration-150 hover:text-ink hover:decoration-ink"
          >
            add a word
          </Link>
        </p>
      </section>

      <Suspense fallback={<div className="h-[420px] border-t border-hairline" />}>
        <DialectBrowser items={dialectKey} selected={selected} />
      </Suspense>

      <section className="pt-14">
        <div className="mb-5 flex items-baseline gap-3">
          <h2
            className="font-mono text-[11px] uppercase tracking-[0.11em]"
            style={{ color: activeRegion?.color ?? "var(--color-faint)" }}
          >
            {activeRegion ? activeRegion.name : "All dialects"}
          </h2>
          <span className="numeric-tabular font-mono text-[11px] text-faint">
            {rows.length}
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="border-t border-hairline px-8 py-20 text-center">
            <p className="font-display text-[24px] leading-tight text-ink">
              {activeRegion ? `Nothing from ${activeRegion.name} yet` : "No entries yet"}
            </p>
            <p className="mx-auto mt-2 max-w-[42ch] text-[15px] leading-relaxed text-muted">
              {activeRegion
                ? "This dialect is waiting for its first word. If you speak it, you are the person to add one."
                : "This dictionary stays empty until someone fills it. The first word could be yours."}
            </p>
          </div>
        ) : (
          <EntryList entries={rows} />
        )}
      </section>
    </>
  );
}
