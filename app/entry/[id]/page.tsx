import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isPreviewMode, previewEntry } from "@/lib/preview";
import { EditorBadge } from "@/components/entry/EditorBadge";
import { EditorMark } from "@/components/entry/EditorMark";
import { RegionMark } from "@/components/entry/RegionMark";
import type { EntryCard } from "@/types/database";

async function getEntry(id: string): Promise<EntryCard | null> {
  if (isPreviewMode) return previewEntry(id) ?? null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("entries")
    .select(
      // Two rules here, both learned the hard way. PostgREST rejects any
      // whitespace in a select parameter, so this stays on one line. And
      // entries reaches profiles three ways (submitted_by, reviewed_by, and
      // through votes), so the foreign key must be named or it refuses to
      // guess and the query fails.
      "id,term,gloss,gloss_secondary,part_of_speech,example_term,example_gloss,note,status,editor_checked,score,flag_count,created_at,submitted_by,regions!inner(slug,name,area,color),profiles!entries_submitted_by_fkey(handle)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;

  const r = data.regions as unknown as {
    slug: string; name: string; area: string; color: string;
  };
  const p = data.profiles as unknown as { handle: string };

  return {
    ...data,
    region_slug: r.slug,
    region_name: r.name,
    region_area: r.area,
    region_color: r.color,
    submitter_handle: p.handle,
    total_count: 1,
  } as EntryCard;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const entry = await getEntry((await params).id);
  if (!entry) return { title: "Entry not found" };
  return { title: entry.term, description: `${entry.term}: ${entry.gloss}` };
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function EntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const entry = await getEntry((await params).id);
  if (!entry) notFound();

  return (
    <article
      className="mx-auto max-w-[720px] pt-12"
      style={{ "--region": entry.region_color } as React.CSSProperties}
    >
      <Link
        href="/"
        className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.09em] text-faint transition-colors duration-150 hover:text-ink"
      >
        <span className="transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-0.5">
          &larr;
        </span>
        Back to the dictionary
      </Link>

      {/* The dialect owns the top edge of the entry, at full width. */}
      <div className="mt-6 overflow-hidden rounded-[6px] border border-hairline shadow-rest">
        <div className="h-1.5 w-full" style={{ backgroundColor: entry.region_color }} />

        <div className="region-tint px-8 pb-10 pt-8 sm:px-12">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <RegionMark name={entry.region_name} color={entry.region_color} size="lg" />
            <span className="text-[13px] text-muted">{entry.region_area}</span>
          </div>

          <div className="mt-6 flex items-start gap-3">
            <h1 className="font-display text-[clamp(44px,8vw,68px)] font-normal leading-[0.98] tracking-[-0.03em] text-ink">
              {entry.term}
            </h1>
            {entry.editor_checked ? (
              <EditorBadge size={22} className="mt-3" />
            ) : null}
          </div>

          <dl className="mt-6 space-y-3">
            <div className="flex items-baseline gap-4">
              <dt className="w-[78px] shrink-0 font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
                English
              </dt>
              <dd className="text-[22px] leading-snug text-ink-soft">{entry.gloss}</dd>
            </div>
            {entry.gloss_secondary ? (
              <div className="flex items-baseline gap-4">
                <dt className="w-[78px] shrink-0 font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
                  Indonesian
                </dt>
                <dd className="text-[17px] leading-snug text-muted">
                  {entry.gloss_secondary}
                </dd>
              </div>
            ) : null}
          </dl>

          {entry.part_of_speech ? (
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
              {entry.part_of_speech}
            </p>
          ) : null}
        </div>

        {entry.example_term || entry.note ? (
          <div className="divide-y divide-hairline border-t border-hairline bg-surface">
            {entry.example_term ? (
              <section className="px-8 py-7 sm:px-12">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
                  Example
                </h2>
                <p className="mt-3 font-display text-[20px] italic leading-relaxed text-ink">
                  {entry.example_term}
                </p>
                {entry.example_gloss ? (
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
                    {entry.example_gloss}
                  </p>
                ) : null}
              </section>
            ) : null}

            {entry.note ? (
              <section className="px-8 py-7 sm:px-12">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
                  Note
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{entry.note}</p>
              </section>
            ) : null}
          </div>
        ) : null}

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline bg-surface px-8 py-5 sm:px-12">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
              Submitted by
            </span>
            <span className="font-mono text-[13px] text-ink">{entry.submitter_handle}</span>
          </div>
          <div className="flex items-center gap-5">
            {entry.editor_checked ? (
              <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.09em] text-seal">
                <EditorMark size={13} className="text-seal" />
                Checked by an editor
              </span>
            ) : entry.status === "verified" ? (
              <span className="font-mono text-[11px] uppercase tracking-[0.09em] text-muted">
                Verified by {entry.score} votes
              </span>
            ) : (
              <span className="font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
                Not yet verified
              </span>
            )}
            <span className="numeric-tabular text-[13px] text-faint">
              {dateFormat.format(new Date(entry.created_at))}
            </span>
          </div>
        </footer>
      </div>

    </article>
  );
}
