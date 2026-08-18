import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ReviewCard, type QueueEntry } from "@/components/admin/ReviewCard";

export const metadata: Metadata = { title: "Review queue" };

export default async function AdminQueuePage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("entries")
    .select(
      "id,term,gloss,gloss_secondary,part_of_speech,example_term,example_gloss,note,score,flag_count,created_at,status,regions(name,color,area),profiles!entries_submitted_by_fkey(handle)",
    )
    .eq("status", "pending")
    .order("flag_count", { ascending: false })
    .order("created_at", { ascending: true });

  const queue = (data ?? []) as unknown as QueueEntry[];

  return (
    <div className="mx-auto max-w-[760px]">
      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
        {queue.length} unverified
      </p>

      {queue.length === 0 ? (
        <div className="mt-8 rounded-[6px] border border-dashed border-hairline-strong px-8 py-16 text-center">
          <p className="font-display text-[22px] text-ink">Everything is verified</p>
          <p className="mx-auto mt-2 max-w-[40ch] text-[15px] leading-relaxed text-muted">
            Every live entry has been checked. New submissions appear here the
            moment they are added, oldest first, with anything reported on top.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-5">
          {queue.map((e) => (
            <ReviewCard key={e.id} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}
