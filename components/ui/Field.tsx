"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { fast } from "@/lib/motion";

export function Field({
  label,
  hint,
  error,
  optional,
  counter,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  counter?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label className="font-mono text-[11px] uppercase tracking-[0.09em] text-muted">
          {label}
          {optional ? (
            <span className="ml-2 normal-case tracking-normal text-faint">
              opsional
            </span>
          ) : null}
        </label>
        {counter ? (
          <span className="numeric-tabular font-mono text-[11px] text-faint">
            {counter}
          </span>
        ) : null}
      </div>

      {children}

      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={fast}
            className="text-[13px] text-danger"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fast}
            className="text-[13px] leading-snug text-faint"
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const control =
  "w-full bg-surface border border-hairline rounded-[2px] px-3.5 text-[15px] " +
  "text-ink placeholder:text-faint transition-[border-color,box-shadow] duration-150 " +
  "hover:border-hairline-strong focus:border-ink focus:outline-none " +
  "focus:shadow-[0_0_0_3px_rgba(27,25,23,0.07)]";

export const inputClass = `${control} h-11`;
export const textareaClass = `${control} py-2.5 leading-relaxed resize-none`;
export const selectClass = `${control} h-11 appearance-none cursor-pointer pr-9`;
