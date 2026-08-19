import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_DICTIONARY } from "@/lib/constants";
import { EntryList } from "@/components/entry/EntryList";
import { DialectBrowser } from "@/components/map/DialectBrowser";
import { SearchField } from "@/components/search/SearchField";
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
  searchParams: Promise<{ dialect?: string; q?: string }>;
}) {
  const { dialect, q } = await searchParams;
  const query = (q ?? "").trim();
  const selected = dialect && REGION_BY_SLUG.has(dialect) ? dialect : null;

  const supabase = await createClient();
  const [{ data: counts }, { data: entries }] = await Promise.all([
    supabase.rpc("region_counts", { dict: DEFAULT_DICTIONARY }),
    supabase.rpc("search_entries", {
      q: query || null,
      dict: DEFAULT_DICTIONARY,
      region_slugs: selected ? [selected] : null,
      lim: 60,
    }),
  ]);

  const fetchedKey = (counts ?? []) as DialectKeyItem[];
  const dialectKey = isPreviewMode
    ? previewKey()
    : fetchedKey.length > 0
      ? fetchedKey
      : previewKey().map((r) => ({ ...r, entry_count: 0 }));

  let rows = isPreviewMode ? PREVIEW_ENTRIES : ((entries ?? []) as EntryCard[]);
  if (isPreviewMode) {
    if (selected) rows = rows.filter((e) => e.region_slug === selected);
    if (query) {
      const n = query.toLowerCase();
      rows = rows.filter((e) =>
        [e.term, e.gloss, e.gloss_secondary ?? ""].some((f) =>
          f.toLowerCase().includes(n),
        ),
      );
    }
  }

  const total = dialectKey.reduce((sum, r) => sum + Number(r.entry_count), 0);
  const activeRegion = selected ? REGION_BY_SLUG.get(selected)! : null;

  return (
    <>
      {/* Front matter, at reading size. A reference work says what it is and
          then shows you the entries. */}
      <section className="py-10">
        <h1 className="font-mono text-[12px] uppercase tracking-[0.14em] text-faint">
          Sasak dictionary
        </h1>
        {/* The stakes, before the mechanics. Someone arriving cold should
            understand why this matters before they understand how it works. */}
        <p className="mt-5 max-w-[46ch] text-[clamp(19px,2.2vw,23px)] leading-[1.35] tracking-[-0.01em] text-ink">
          Around three million people speak Sasak. Almost none of it has ever
          been written down.
        </p>

        <p className="mt-5 max-w-[64ch] text-[16px] leading-relaxed text-muted">
          On Lombok, Indonesian is the language of school, work and the internet,
          and each generation carries a little less of the vocabulary that exists
          nowhere but in speech. Every word here is recorded with the dialect it
          came from and translated into both English and Indonesian, so it reaches
          a learner abroad and a speaker at home. Five dialects, no standard
          spelling, and a red tick on the entries an editor has verified.
        </p>

        <p className="mt-4 max-w-[64ch] text-[15px] leading-relaxed text-faint">
          Sasak is where SAWAH starts, not where it stops.{" "}
          <Link
            href="/roadmap"
            className="underline decoration-hairline-strong underline-offset-[3px] transition-colors duration-150 hover:text-ink hover:decoration-ink"
          >
            Where it goes next
          </Link>
          .
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
        {/* Search sits in the list header rather than above it, so it reads as
            a control on the list instead of a banner across the page. */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-hairline pb-3">
          <div className="flex items-baseline gap-3">
            <h2
              className="font-mono text-[11px] uppercase tracking-[0.11em]"
              style={{ color: activeRegion?.color ?? "var(--color-faint)" }}
            >
              {query ? (rows.length === 1 ? "1 match" : `${rows.length} matches`) : activeRegion ? activeRegion.name : "All dialects"}
            </h2>
            <span className="numeric-tabular font-mono text-[11px] text-faint">
              {query ? (activeRegion ? `in ${activeRegion.name}` : "across three languages") : rows.length}
            </span>
          </div>

          <Suspense fallback={<div className="h-9 w-[168px]" />}>
            <SearchField initialQuery={query} />
          </Suspense>
        </div>

        {rows.length === 0 ? (
          <div className="border-t border-hairline px-8 py-20 text-center">
            <p className="font-display text-[24px] leading-tight text-ink">
              {query
                ? `Nothing for \u201C${query}\u201D`
                : activeRegion
                  ? `Nothing from ${activeRegion.name} yet`
                  : "No entries yet"}
            </p>
            <p className="mx-auto mt-2 max-w-[44ch] text-[15px] leading-relaxed text-muted">
              {query
                ? "Search reaches Sasak, English and Indonesian, and tolerates loose spelling. If it is not here, it has not been written down yet. You could be the one to add it."
                : activeRegion
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
