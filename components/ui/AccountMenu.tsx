"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/lib/actions/auth";
import { base, fast } from "@/lib/motion";
import type { Profile } from "@/types/database";

export function AccountMenu({ profile }: { profile: Profile | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!profile) {
    return (
      <Link
        href="/login"
        className="ml-2 inline-flex h-9 items-center rounded-[2px] bg-ink px-4 text-[14px] font-medium text-paper shadow-rest transition-colors duration-150 hover:bg-ink-soft"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative ml-1">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-9 items-center gap-2 rounded-[2px] border border-hairline bg-surface px-3 transition-colors duration-150 hover:border-hairline-strong"
      >
        <span className="font-mono text-[12px] text-ink">{profile.handle}</span>
        <motion.svg
          width="9"
          height="6"
          viewBox="0 0 9 6"
          fill="none"
          animate={{ rotate: open ? 180 : 0 }}
          transition={fast}
        >
          <path d="M1 1L4.5 4.5L8 1" stroke="#9C958B" strokeWidth="1.4" strokeLinecap="round" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={base}
            style={{ originY: 0 }}
            className="absolute right-0 top-11 w-56 overflow-hidden rounded-[6px] border border-hairline bg-surface shadow-pop"
          >
            <div className="border-b border-hairline px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
                Anonymous handle
              </p>
              <p className="mt-1 font-mono text-[13px] text-ink">{profile.handle}</p>
            </div>
            <Link
              href="/contributions"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-[14px] text-ink transition-colors duration-150 hover:bg-paper-sunk"
            >
              My contributions
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="w-full px-4 py-2.5 text-left text-[14px] text-muted transition-colors duration-150 hover:bg-paper-sunk hover:text-ink"
              >
                Sign out
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
