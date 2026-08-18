"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitEntry, type SubmitState } from "@/lib/actions/entries";
import { Field, inputClass, selectClass, textareaClass } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { DialectPicker } from "./DialectPicker";
import { PART_OF_SPEECH } from "@/lib/constants";
import { base, slow } from "@/lib/motion";
import type { Region } from "@/types/database";

const initial: SubmitState = { status: "idle" };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending to the queue" : "Submit for review"}
    </Button>
  );
}

/** The entry as it will look once published, drawn the moment it is accepted. */
function Confirmation({
  created,
  onAgain,
}: {
  created: NonNullable<SubmitState["created"]>;
  onAgain: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={slow}
      style={{ "--region": created.regionColor } as React.CSSProperties}
    >
      <div className="overflow-hidden rounded-[6px] border border-hairline shadow-rest">
        <motion.div
          className="h-1.5 w-full origin-left"
          style={{ backgroundColor: created.regionColor }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="region-tint px-8 py-8">
          <span
            className="font-mono text-[11px] font-medium uppercase tracking-[0.11em]"
            style={{ color: created.regionColor }}
          >
            {created.regionName}
          </span>

          <h2 className="relative mt-3 inline-block font-display text-[40px] leading-none tracking-[-0.02em] text-ink">
            {created.term}
            <motion.span
              aria-hidden="true"
              className="absolute -bottom-1 left-0 h-px w-full origin-left bg-ink"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.42, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            />
          </h2>

          <p className="mt-4 text-[18px] leading-snug text-ink-soft">{created.gloss}</p>
          {created.glossSecondary ? (
            <p className="mt-1 text-[15px] text-muted">{created.glossSecondary}</p>
          ) : null}
        </div>
      </div>

      <p className="mt-6 max-w-[52ch] text-[15px] leading-relaxed text-muted">
        It is in the dictionary already. Once an editor checks it, or enough
        people vouch for it, it earns the verified seal.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={onAgain}>Add another word</Button>
        <Link
          href="/contributions"
          className="inline-flex h-11 items-center rounded-[2px] border border-hairline-strong bg-surface px-5 text-[15px] transition-colors duration-150 hover:border-ink"
        >
          See my contributions
        </Link>
      </div>
    </motion.div>
  );
}

export function SubmitForm({ regions }: { regions: Region[] }) {
  const [state, formAction] = useActionState(submitEntry, initial);
  const [region, setRegion] = useState("");
  const [term, setTerm] = useState("");
  const [gloss, setGloss] = useState("");
  const [formKey, setFormKey] = useState(0);
  const renderedAt = useRef<number>(0);

  // Stamped on the client at mount. The action rejects anything returned
  // faster than a person could plausibly type it.
  useEffect(() => {
    renderedAt.current = Date.now();
  }, [formKey]);

  const err = state.fieldErrors ?? {};

  if (state.status === "success" && state.created) {
    return (
      <Confirmation
        created={state.created}
        onAgain={() => {
          setTerm("");
          setGloss("");
          setRegion("");
          setFormKey((k) => k + 1);
          window.location.href = "/submit";
        }}
      />
    );
  }

  return (
    <form key={formKey} action={formAction} className="flex flex-col gap-8">
      {/* bot traps */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="renderedAt" value={renderedAt.current} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Sasak word or phrase"
          error={err.term}
          counter={`${term.length}/80`}
          hint="Spell it the way you say it. There is no standard spelling."
        >
          <input
            name="term"
            required
            maxLength={80}
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className={inputClass}
            placeholder="beleq"
          />
        </Field>

        <Field label="English translation" error={err.gloss} counter={`${gloss.length}/160`}>
          <input
            name="gloss"
            required
            maxLength={160}
            value={gloss}
            onChange={(e) => setGloss(e.target.value)}
            className={inputClass}
            placeholder="big, large"
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Indonesian translation"
          optional
          error={err.glossSecondary}
          hint="Helps Sasak speakers reach the English."
        >
          <input
            name="glossSecondary"
            maxLength={160}
            className={inputClass}
            placeholder="besar, agung"
          />
        </Field>

        <Field label="Part of speech" optional error={err.partOfSpeech}>
          <div className="relative">
            <select name="partOfSpeech" defaultValue="" className={selectClass}>
              <option value="">Not sure</option>
              {PART_OF_SPEECH.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
              width="9"
              height="6"
              viewBox="0 0 9 6"
              fill="none"
            >
              <path d="M1 1L4.5 4.5L8 1" stroke="#9C958B" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
        </Field>
      </div>

      <DialectPicker
        regions={regions}
        value={region}
        onChange={setRegion}
        error={err.regionSlug}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Example in Sasak" optional error={err.exampleTerm}>
          <textarea name="exampleTerm" rows={2} maxLength={240} className={textareaClass} placeholder="Bale beleq" />
        </Field>
        <Field label="What the example means" optional error={err.exampleGloss}>
          <textarea name="exampleGloss" rows={2} maxLength={240} className={textareaClass} placeholder="a big house" />
        </Field>
      </div>

      <Field
        label="Note"
        optional
        error={err.note}
        hint="Anything a learner should know. When it is used, who says it, how it shifts between villages."
      >
        <textarea name="note" rows={3} maxLength={400} className={textareaClass} />
      </Field>

      <div className="flex flex-wrap items-center gap-4 border-t border-hairline pt-6">
        <Submit />
        <AnimatePresence>
          {state.message ? (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={base}
              className="text-[14px] text-danger"
            >
              {state.message}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </form>
  );
}
