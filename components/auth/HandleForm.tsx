"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState, useState } from "react";
import { changeHandle, type HandleState } from "@/lib/actions/profile";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { base, fast } from "@/lib/motion";

const initial: HandleState = { status: "idle" };

/**
 * The handle is the only identity the dictionary shows. One change is allowed,
 * so entries stay attributable over time.
 */
export function HandleForm({ handle, locked }: { handle: string; locked: boolean }) {
  const [state, formAction] = useActionState(changeHandle, initial);
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[6px] border border-hairline bg-surface px-6 py-5 shadow-rest">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
            Public handle
          </p>
          <p className="mt-1 font-mono text-[15px] text-ink">{handle}</p>
        </div>

        {locked ? (
          <p className="max-w-[26ch] text-right text-[12px] leading-snug text-faint">
            Already changed once. This one is permanent.
          </p>
        ) : (
          <button
            onClick={() => setOpen((v) => !v)}
            className="font-mono text-[11px] uppercase tracking-[0.09em] text-muted underline decoration-hairline-strong underline-offset-[3px] transition-colors duration-150 hover:text-ink hover:decoration-ink"
          >
            {open ? "Cancel" : "Change once"}
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && !locked ? (
          <motion.form
            action={formAction}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={base}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-end gap-3 pt-5">
              <input
                name="handle"
                defaultValue={handle}
                maxLength={24}
                className={`${inputClass} max-w-[260px] font-mono`}
                placeholder="lowercase-and-hyphens"
              />
              <Button type="submit">Save</Button>
            </div>
            <p className="pt-2 text-[12px] text-faint">
              Lowercase letters, numbers and hyphens. You only get one change.
            </p>
          </motion.form>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {state.message ? (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={fast}
            className={`mt-3 text-[13px] ${state.status === "success" ? "text-seal" : "text-danger"}`}
          >
            {state.message}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
