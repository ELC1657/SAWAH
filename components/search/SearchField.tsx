"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { fast } from "@/lib/motion";

/**
 * Deliberately quiet: a rule and a glyph, no box and no fill, sitting in the
 * list header rather than occupying a block of its own. It widens when it has
 * your attention and shrinks back when it does not.
 *
 * The query lives in the URL so a search is shareable, and is pushed with
 * replace() so typing does not fill the back button one keystroke at a time.
 */
export function SearchField({ initialQuery }: { initialQuery: string }) {
  const [value, setValue] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const [, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const params = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const lastPushed = useRef(initialQuery);

  // Follow the URL when it changes from elsewhere: back button, dialect click.
  useEffect(() => {
    if (initialQuery !== lastPushed.current) {
      lastPushed.current = initialQuery;
      setValue(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === lastPushed.current) return;

    const timer = setTimeout(() => {
      lastPushed.current = trimmed;
      const next = new URLSearchParams(params.toString());
      if (trimmed) next.set("q", trimmed);
      else next.delete("q");
      const qs = next.toString();
      startTransition(() => router.replace(qs ? `/?${qs}` : "/", { scroll: false }));
    }, 220);

    return () => clearTimeout(timer);
  }, [value, params, router]);

  const hasText = value.length > 0;
  const open = focused || hasText;

  // "/" focuses the field, the way it does in most tools people already use.
  // Ignored while typing anywhere else so it never eats a real slash.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el?.isContentEditable;
      if (typing) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative w-full sm:w-auto">
      <label htmlFor="dictionary-search" className="sr-only">
        Search the dictionary in Sasak, English or Indonesian
      </label>

      <motion.div
        className="relative flex items-center"
        animate={reduceMotion ? undefined : { width: open ? 288 : 208 }}
        initial={false}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: "100%" }}
      >
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          className={`pointer-events-none absolute left-0 transition-colors duration-150 ${
            open ? "text-ink" : "text-muted"
          }`}
        >
          <circle cx="7" cy="7" r="4.6" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10.6 10.6L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>

        <input
          id="dictionary-search"
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setValue("");
              inputRef.current?.blur();
            }
          }}
          placeholder="Search words"
          autoComplete="off"
          spellCheck={false}
          className="h-9 w-full border-0 border-b border-hairline-strong bg-transparent pb-1 pl-[22px] pr-7 text-[15px] text-ink placeholder:text-muted transition-colors duration-150 focus:border-ink focus:outline-none focus:ring-0 [&::-webkit-search-cancel-button]:appearance-none"
        />

        <AnimatePresence initial={false} mode="wait">
          {!open ? (
            <motion.kbd
              key="slash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fast}
              aria-hidden="true"
              className="pointer-events-none absolute right-0 flex h-[18px] w-[18px] items-center justify-center rounded-[3px] border border-hairline-strong font-mono text-[10px] leading-none text-faint"
            >
              /
            </motion.kbd>
          ) : hasText ? (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fast}
              key="clear"
              onClick={() => {
                setValue("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-0 flex h-5 w-5 items-center justify-center text-faint transition-colors duration-150 hover:text-ink"
            >
              <svg width="9" height="9" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </motion.button>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
