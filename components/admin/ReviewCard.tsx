"use client";

import { motion } from "motion/react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { moderateEntry, type ModerationState } from "@/lib/actions/moderation";
import { RegionMark } from "@/components/entry/RegionMark";
import { PROMOTE_THRESHOLD } from "@/lib/constants";
import { base } from "@/lib/motion";

export type QueueEntry = {
  id: string;
  term: string;
  gloss: string;
  gloss_secondary: string | null;
  part_of_speech: string | null;
  example_term: string | null;
  example_gloss: string | null;
  note: string | null;
  score: number;
  flag_count: number;
  created_at: string;
  status: string;
  regions: { name: string; color: string; area: string } | null;
  profiles: { handle: string } | null;
};

const initial: ModerationState = { status: "idle" };

function Decide({ label, tone }: { label: string; tone: "publish" | "reject" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={[
        "h-9 rounded-[2px] px-4 text-[13px] font-medium transition-all duration-150 disabled:opacity-50",
        tone === "publish"
          ? "bg-ink text-paper hover:bg-ink-soft"
          : "border border-hairline-strong bg-surface text-muted hover:border-danger hover:text-danger",
      ].join(" ")}
    >
      {pending ? "Saving" : label}
    </button>
  );
}

export function ReviewCard({ entry }: { entry: QueueEntry }) {
  const [state, formAction] = useActionState(moderateEntry, initial);
  const color = entry.regions?.color ?? "#6B6660";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={base}
      className="overflow-hidden rounded-[6px] border border-hairline bg-surface shadow-rest"
      style={{ "--region": color } as React.CSSProperties}
    >
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {entry.regions ? (
            <RegionMark name={entry.regions.name} color={color} />
          ) : null}
          <div className="flex items-center gap-4 font-mono text-[11px] text-faint">
            <span>{entry.profiles?.handle ?? "unknown"}</span>
            <span className="numeric-tabular">
              {entry.score} / {PROMOTE_THRESHOLD} votes
            </span>
            {entry.flag_count > 0 ? (
              <span className="text-danger">{entry.flag_count} reported</span>
            ) : null}
          </div>
        </div>

        <h2 className="mt-3 font-display text-[32px] leading-none tracking-[-0.02em] text-ink">
          {entry.term}
        </h2>

        <dl className="mt-4 space-y-1.5">
          <div className="flex gap-3">
            <dt className="w-[72px] shrink-0 font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
              English
            </dt>
            <dd className="text-[16px] text-ink-soft">{entry.gloss}</dd>
          </div>
          {entry.gloss_secondary ? (
            <div className="flex gap-3">
              <dt className="w-[72px] shrink-0 font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
                Indonesian
              </dt>
              <dd className="text-[15px] text-muted">{entry.gloss_secondary}</dd>
            </div>
          ) : null}
          {entry.part_of_speech ? (
            <div className="flex gap-3">
              <dt className="w-[72px] shrink-0 font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
                Type
              </dt>
              <dd className="text-[15px] text-muted">{entry.part_of_speech}</dd>
            </div>
          ) : null}
        </dl>

        {entry.example_term ? (
          <p className="mt-4 border-l-2 pl-3 text-[14px] italic leading-relaxed text-muted" style={{ borderColor: color }}>
            {entry.example_term}
            {entry.example_gloss ? (
              <span className="not-italic text-faint"> &middot; {entry.example_gloss}</span>
            ) : null}
          </p>
        ) : null}

        {entry.note ? (
          <p className="mt-3 text-[14px] leading-relaxed text-muted">{entry.note}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-hairline pt-4">
          <form action={formAction}>
            <input type="hidden" name="entryId" value={entry.id} />
            <input type="hidden" name="decision" value="verified" />
            <Decide label="Verify" tone="publish" />
          </form>
          <form action={formAction}>
            <input type="hidden" name="entryId" value={entry.id} />
            <input type="hidden" name="decision" value="rejected" />
            <Decide label="Remove" tone="reject" />
          </form>
          {state.message ? (
            <span className="ml-2 text-[13px] text-danger">{state.message}</span>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
