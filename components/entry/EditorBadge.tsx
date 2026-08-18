"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { EditorMark } from "./EditorMark";

/**
 * The seal, with a pill that slides out of it on hover.
 *
 * The pill grows in normal flow rather than overlaying, because the mark always
 * sits at the end of a heading with empty space to its right. Nothing on the
 * row moves when it opens.
 */
export function EditorBadge({
  size = 14,
  label = "Verified",
  className = "",
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const ease = reduceMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <motion.span
      layout
      onHoverStart={() => setOpen(true)}
      onHoverEnd={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      transition={ease}
      animate={{
        backgroundColor: open ? "rgba(192,52,31,0.10)" : "rgba(192,52,31,0)",
      }}
      className={`relative inline-flex shrink-0 items-center overflow-hidden rounded-full align-middle text-seal ${className}`}
    >
      <EditorMark size={size} className="shrink-0" />

      <AnimatePresence initial={false}>
        {open ? (
          <motion.span
            key="label"
            layout
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={ease}
            aria-hidden="true"
            className="overflow-hidden whitespace-nowrap"
          >
            <span className="block pl-1.5 pr-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.11em]">
              {label}
            </span>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.span>
  );
}
