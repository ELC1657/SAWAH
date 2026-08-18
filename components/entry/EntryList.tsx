"use client";

import { AnimatePresence, motion } from "motion/react";
import { EntryRow } from "./EntryRow";
import { base } from "@/lib/motion";
import type { EntryCard } from "@/types/database";

/**
 * Rows are keyed by entry id, so switching dialect reorders and fades the ones
 * that actually changed instead of blanking the whole list.
 */
export function EntryList({ entries }: { entries: EntryCard[] }) {
  return (
    <div className="overflow-hidden rounded-[6px] border border-hairline shadow-rest">
      <AnimatePresence initial={false} mode="popLayout">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            layout="position"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { ...base, delay: Math.min(i, 8) * 0.022 } }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={base}
          >
            <EntryRow entry={entry} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
