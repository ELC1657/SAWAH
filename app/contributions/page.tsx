import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/supabase/session";
import { StatusTag } from "@/components/entry/StatusTag";
import { RegionMark } from "@/components/entry/RegionMark";
import { EditorBadge } from "@/components/entry/EditorBadge";
import { HandleForm } from "@/components/auth/HandleForm";
import { PROMOTE_THRESHOLD } from "@/lib/constants";
import type { EntryStatus } from "@/types/database";

export const metadata: Metadata = { title: "My contributions" };

type Row = {
  id: string;
  term: string;
  gloss: string;
  status: EntryStatus;
  editor_checked: boolean;
  score: number;
  created_at: string;
  regions: { name: string; color: string } | null;
};

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function ContributionsPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?next=/contributions");

  const supabase = await createClient();
  const { data } = await supabase
    .from("entries")
    .select("id,term,gloss,status,editor_checked,score,created_at,regions(name,color)")
    .eq("submitted_by", profile.id)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as Row[];
  const published = rows.filter((r) => r.status === "verified").length;
  const inReview = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto max-w-[820px] pt-12">
      <h1 className="font-mono text-[12px] uppercase tracking-[0.14em] text-faint">
        My contributions
      </h1>

      <p className="numeric-tabular mt-4 font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
        {rows.length} submitted
        <span className="mx-2 text-hairline-strong">/</span>
        {published} published
        <span className="mx-2 text-hairline-strong">/</span>
        {inReview} in review
      </p>

      <div className="mt-8">
        <HandleForm handle={profile.handle} locked={profile.handle_changed} />
      </div>

      <div className="mt-12">
        {rows.length === 0 ? (
          <div className="rounded-[6px] border border-dashed border-hairline-strong px-8 py-16 text-center">
            <p className="font-display text-[22px] text-ink">Nothing yet</p>
            <p className="mx-auto mt-2 max-w-[40ch] text-[15px] leading-relaxed text-muted">
              The dictionary grows one word at a time, and none of them are here
              until somebody writes them down.
            </p>
            <Link
              href="/submit"
              className="mt-6 inline-flex h-11 items-center rounded-[2px] bg-ink px-5 text-[15px] font-medium text-paper transition-colors duration-150 hover:bg-ink-soft"
            >
              Add your first word
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[6px] border border-hairline shadow-rest">
            {rows.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline bg-surface px-6 py-5 last:border-b-0"
                style={{ "--region": r.regions?.color ?? "#6B6660" } as React.CSSProperties}
              >
                <div className="flex min-w-0 items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-8 w-[3px] shrink-0"
                    style={{ backgroundColor: r.regions?.color ?? "#6B6660" }}
                  />
                  <div className="min-w-0">
                    {r.regions ? (
                      <RegionMark name={r.regions.name} color={r.regions.color} />
                    ) : null}
                    <p className="mt-1.5 flex items-center gap-2 font-display text-[22px] leading-tight text-ink">
                      {r.status === "verified" ? (
                        <Link href={`/entry/${r.id}`} className="hover:underline underline-offset-4">
                          {r.term}
                        </Link>
                      ) : (
                        r.term
                      )}
                      {r.editor_checked ? <EditorBadge size={13} /> : null}
                    </p>
                    <p className="text-[15px] text-muted">{r.gloss}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <StatusTag status={r.status} />
                  <span className="numeric-tabular font-mono text-[11px] text-faint">
                    {r.status === "pending"
                      ? `${r.score} of ${PROMOTE_THRESHOLD} votes`
                      : dateFormat.format(new Date(r.created_at))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
