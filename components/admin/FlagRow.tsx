"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { resolveFlag, type ModerationState } from "@/lib/actions/moderation";
import { RegionMark } from "@/components/entry/RegionMark";
import { FLAG_REASONS } from "@/lib/constants";
import { base } from "@/lib/motion";

export type FlagItem = {
  id: string;
  reason: string;
  detail: string | null;
  status: string;
  created_at: string;
  entries: {
    id: string;
    term: string;
    gloss: string;
    status: string;
    regions: { name: string; color: string } | null;
  } | null;
  profiles: { handle: string } | null;
};

const initial: ModerationState = { status: "idle" };
const REASON = new Map<string, string>(FLAG_REASONS.map((r) => [r.value, r.label]));

function Act({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-8 rounded-[2px] border border-hairline-strong bg-surface px-3 text-[12px] text-muted transition-colors duration-150 hover:border-ink hover:text-ink disabled:opacity-50"
    >
      {pending ? "Saving" : label}
    </button>
  );
}

export function FlagRow({ flag }: { flag: FlagItem }) {
  const [state, formAction] = useActionState(resolveFlag, initial);
  const color = flag.entries?.regions?.color ?? "#6B6660";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={base}
      className="rounded-[6px] border border-hairline bg-surface p-5 shadow-rest"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.09em] text-danger">
          {REASON.get(flag.reason) ?? flag.reason}
        </span>
        <span className="font-mono text-[11px] text-faint">
          reported by {flag.profiles?.handle ?? "unknown"}
        </span>
      </div>

      {flag.entries ? (
        <div className="mt-3 flex items-baseline gap-3">
          {flag.entries.regions ? (
            <RegionMark name={flag.entries.regions.name} color={color} />
          ) : null}
          <Link
            href={`/entry/${flag.entries.id}`}
            className="font-display text-[22px] text-ink hover:underline underline-offset-4"
          >
            {flag.entries.term}
          </Link>
          <span className="text-[15px] text-muted">{flag.entries.gloss}</span>
        </div>
      ) : null}

      {flag.detail ? (
        <p className="mt-3 border-l border-hairline pl-3 text-[14px] leading-relaxed text-muted">
          {flag.detail}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-hairline pt-3">
        <form action={formAction}>
          <input type="hidden" name="flagId" value={flag.id} />
          <input type="hidden" name="outcome" value="resolved" />
          <Act label="Acted on it" />
        </form>
        <form action={formAction}>
          <input type="hidden" name="flagId" value={flag.id} />
          <input type="hidden" name="outcome" value="dismissed" />
          <Act label="Dismiss" />
        </form>
        {state.message ? (
          <span className="ml-2 text-[13px] text-danger">{state.message}</span>
        ) : null}
      </div>
    </motion.div>
  );
}
