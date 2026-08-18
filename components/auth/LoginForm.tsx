"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestMagicLink, type AuthState } from "@/lib/actions/auth";
import { Field, inputClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { base, slow } from "@/lib/motion";

const initial: AuthState = { status: "idle" };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Sending the link" : "Send a sign in link"}
    </Button>
  );
}

/** The stamp that draws itself once the link is on its way. */
function SentMark() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <motion.circle
        cx="22"
        cy="22"
        r="20"
        stroke="#4F7A46"
        strokeWidth="1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ rotate: -90, transformOrigin: "center" }}
      />
      <motion.path
        d="M14 22.5L19.5 28L30 17"
        stroke="#4F7A46"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.32, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

export function LoginForm({
  next,
  initialError,
}: {
  next?: string;
  initialError?: string;
}) {
  const [state, formAction] = useActionState(requestMagicLink, initial);

  const linkError =
    initialError === "missing_code"
      ? "That link was incomplete. Request a new one below."
      : initialError
        ? `Sign in failed: ${initialError}. Request a new link below.`
        : undefined;

  return (
    <div className="mt-10">
      <AnimatePresence mode="wait" initial={false}>
        {state.status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={slow}
            className="rounded-[6px] border border-hairline bg-surface p-8 shadow-rest"
          >
            <SentMark />
            <h2 className="mt-5 font-display text-[22px] leading-tight text-ink">
              Check your inbox
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              The link is on its way to{" "}
              <span className="font-mono text-[13px] text-ink">{state.email}</span>. It
              lasts one hour and works exactly once.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            action={formAction}
            initial={false}
            exit={{ opacity: 0, y: -8 }}
            transition={base}
            className="flex flex-col gap-6"
          >
            <input type="hidden" name="next" value={next ?? "/"} />
            <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="website">Leave this field empty</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <Field label="Email" error={state.message ?? linkError}>
              <input
                name="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClass}
              />
            </Field>

            <Submit />
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
