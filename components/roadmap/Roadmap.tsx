"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { REGIONS } from "@/lib/regions";

type State = "built" | "next" | "later";

type Feature = { name: string; detail: string };

type Phase = {
  numeral: string;
  label: string;
  title: string;
  blurb: string;
  color: string;
  state: State;
  features: Feature[];
};

/** Phase colours walk the five dialects in map order, north to south. */
/** The fifth dialect colour, reserved for the closing movement. */
const FINALE = REGIONS[1].color;

const PHASES: Phase[] = [
  {
    numeral: "01",
    label: "Shipped",
    title: "A dictionary that exists",
    blurb:
      "Everything here is live on this site right now. You can use all of it today.",
    color: REGIONS[0].color,
    state: "built",
    features: [
      {
        name: "Three level dialect map",
        detail:
          "Indonesia at a glance, Lombok up close, then a single dialect area filling the frame. Clicking any region filters the dictionary to it, and the view is shareable as a link.",
      },
      {
        name: "Five dialect regions",
        detail:
          "Kuto-Kute, Ngeto-Ngete, Ngeno-Ngene, Meno-Mene and Meriaq-Meriku, drawn from real coastline data. Each owns a colour that follows its words everywhere they appear.",
      },
      {
        name: "Trilingual entries",
        detail:
          "A Sasak headword, an English translation, an optional Indonesian bridge for local speakers, plus example sentences and usage notes.",
      },
      {
        name: "Passwordless accounts",
        detail:
          "Sign in with a one time email link. Work is credited to an anonymous handle, and your address never appears anywhere in the dictionary.",
      },
      {
        name: "Immediate publishing",
        detail:
          "A word you add is public the second you submit it. Nothing sits in a drawer waiting for permission before anyone can learn from it.",
      },
      {
        name: "The editor seal",
        detail:
          "Entries whose translation an editor has verified as accurate carry a red tick. Unchecked ones are shown plainly without one, so you always know which is which.",
      },
      {
        name: "Search across three languages",
        detail:
          "One field reaches Sasak, English and Indonesian at once, with fuzzy matching because Sasak has no standard spelling and the same word gets typed four ways. Results narrow as you type and the query stays in the URL, so a search is shareable.",
      },
      {
        name: "Abuse controls",
        detail:
          "Submission rate limits, duplicate detection that is blind to case and spacing, and bot traps on the form. All enforced by the database, not just the page.",
      },
    ],
  },
  {
    numeral: "02",
    label: "In build",
    title: "Proof from the people who speak it",
    blurb:
      "A living language is settled by the people who use it. These give speakers the final word.",
    color: REGIONS[2].color,
    state: "next",
    features: [
      {
        name: "Community verification",
        detail:
          "Vote a word up or down. Five net votes earn it the seal without an editor ever touching it, so the dictionary can outgrow whoever started it.",
      },
      {
        name: "Reporting",
        detail:
          "Flag a wrong translation or a mistaken dialect tag, with a reason. A reported word stops being eligible for automatic verification until it is settled.",
      },
      {
        name: "Editing your own entries",
        detail:
          "Sharpen a translation or fix a typo after the fact, without deleting the word and starting again.",
      },
      {
        name: "Saved words",
        detail:
          "Keep the words you want to come back to. A learner needs somewhere to put the ones that have not stuck yet, and a speaker needs somewhere to gather the ones worth arguing about.",
      },
      {
        name: "Alphabetical browsing",
        detail:
          "An A to Z index for reading the dictionary straight through, rather than only finding words you already know to look for.",
      },
    ],
  },
  {
    numeral: "03",
    label: "Planned",
    title: "Sound, and being read",
    blurb:
      "A dictionary of a spoken language you can only read is doing half the job.",
    color: REGIONS[3].color,
    state: "later",
    features: [
      {
        name: "Recorded pronunciation",
        detail:
          "Hear a word spoken by someone from that dialect. With no standard spelling, the recording is closer to a reference than the spelling is.",
      },
      {
        name: "English to Sasak",
        detail:
          "Browse from the other direction, so an English speaker can look up the idea and find the Sasak, not only the reverse.",
      },
      {
        name: "Open data export",
        detail:
          "The entire dictionary downloadable in one file under an open licence. Nobody should have to ask us for a language back.",
      },
      {
        name: "Works without signal",
        detail:
          "Installable on a phone and readable offline, because a lot of Lombok is not a place with reliable data.",
      },
      {
        name: "Contributor pages",
        detail:
          "A page per handle showing what someone has added, for those who want the credit visible.",
      },
    ],
  },
  {
    numeral: "04",
    label: "Where it goes",
    title: "Lombok, then everywhere",
    blurb:
      "Nothing in how this is built is specific to Sasak. Every new language is a region that stops being black.",
    color: REGIONS[4].color,
    state: "later",
    features: [
      {
        name: "A second language",
        detail:
          "The proof that the shape holds. The database has handled multiple dictionaries since the first day it existed, and the map takes its regions as data.",
      },
      {
        name: "Language switcher",
        detail:
          "Move between dictionaries from the header, each with its own regions, its own colours and its own contributors.",
      },
      {
        name: "The Indonesian archipelago",
        detail:
          "Over seven hundred living languages, most with nothing a learner can open. The map already draws every island, waiting.",
      },
      {
        name: "Asia, then the world map",
        detail:
          "The same gap repeats at a far larger scale. The rule does not change with the scale: written by the people who speak it.",
      },
    ],
  },
];

/**
 * Status is carried by the shape of the mark, not by a colour or a word, so a
 * shipped feature and a planned one stay distinguishable at a glance and in
 * greyscale. Filled means it exists, hollow means it is being built, a rule
 * means it is intended.
 */
function Marker({
  state,
  color,
  inline = false,
}: {
  state: State;
  color: string;
  inline?: boolean;
}) {
  const nudge = inline ? "" : state === "later" ? "mt-[11px]" : "mt-[8px]";

  if (state === "built") {
    return (
      <span
        aria-hidden="true"
        className={`block h-1.5 w-1.5 shrink-0 rounded-full ${nudge}`}
        style={{ backgroundColor: color }}
      />
    );
  }
  if (state === "next") {
    return (
      <span
        aria-hidden="true"
        className={`block h-1.5 w-1.5 shrink-0 rounded-full border ${nudge}`}
        style={{ borderColor: color }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`block h-px w-2 shrink-0 ${nudge}`}
      style={{ backgroundColor: color, opacity: 0.55 }}
    />
  );
}

export function Roadmap() {
  const track = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start 0.75", "end 0.6"],
  });
  const drawn = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <div className="pb-32">
      {/* Opening. This page is allowed a voice the dictionary itself is not. */}
      <section className="pt-16 sm:pt-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
          Where this is going
        </p>

        <h1 className="mt-6 max-w-[19ch] font-display text-[clamp(40px,7vw,76px)] font-normal leading-[0.98] tracking-[-0.03em] text-ink">
          Most of the map is still black.
        </h1>

        <div className="mt-8 max-w-[54ch] space-y-4 text-[17px] leading-relaxed text-muted">
          <p>
            Indonesia alone has more than seven hundred living languages, and almost
            none of them have a dictionary a learner can actually open. SAWAH begins
            with Sasak, on Lombok, in five dialects.
          </p>
          <p>
            It does not end there. The map is built to be coloured in, and what
            follows is the order we intend to colour it.
          </p>
        </div>

        {/* How to read the marks, since shape carries the status. */}
        <ul className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3">
          {(
            [
              ["built", "Shipped, live today"],
              ["next", "In build"],
              ["later", "Planned"],
            ] as const
          ).map(([state, label]) => (
            <li key={state} className="flex items-center gap-2.5">
              <span className="flex h-3 w-2 items-center justify-center">
                <Marker state={state} color="var(--color-ink)" inline />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
                {label}
              </span>
            </li>
          ))}
        </ul>

        {/* The wordmark rule, given room to be a proper object. */}
        <div className="mt-12 flex h-1 w-full max-w-[420px] overflow-hidden" aria-hidden="true">
          {REGIONS.map((r, i) => (
            <motion.span
              key={r.slug}
              className="h-full flex-1"
              style={{ backgroundColor: r.color }}
              initial={reduceMotion ? false : { scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </div>
      </section>

      {/* Phases, threaded on a line that draws itself as you descend. */}
      <div ref={track} className="relative mt-24 sm:mt-32">
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-px bg-hairline sm:left-[92px]"
        />
        <motion.div
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-px origin-top bg-ink sm:left-[92px]"
          style={{ scaleY: reduceMotion ? 1 : drawn }}
        />

        <div className="flex flex-col gap-24 sm:gap-32">
          {PHASES.map((phase) => (
            <motion.section
              key={phase.numeral}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px -10% 0px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative pl-8 sm:pl-[140px]"
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-[13px] h-px w-5 sm:left-[92px] sm:w-8"
                style={{ backgroundColor: phase.color }}
              />

              <div className="absolute left-0 top-0 hidden sm:block">
                <span
                  className="font-display text-[40px] leading-none tracking-[-0.02em]"
                  style={{ color: phase.color }}
                >
                  {phase.numeral}
                </span>
              </div>

              <p className="flex flex-wrap items-baseline gap-x-3">
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.14em]"
                  style={{ color: phase.color }}
                >
                  <span className="sm:hidden">{phase.numeral} / </span>
                  {phase.label}
                </span>
                <span className="numeric-tabular font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
                  {phase.features.length} features
                </span>
              </p>

              <h2 className="mt-3 max-w-[20ch] font-display text-[clamp(26px,3.6vw,38px)] font-normal leading-[1.05] tracking-[-0.02em] text-ink">
                {phase.title}
              </h2>

              <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed text-muted">
                {phase.blurb}
              </p>

              <ul className="mt-8 flex max-w-[58ch] flex-col">
                {phase.features.map((f) => (
                  <li
                    key={f.name}
                    className="group flex gap-3.5 border-t border-hairline py-4 transition-colors duration-150 last:border-b hover:bg-[color-mix(in_oklab,var(--phase)_5%,transparent)]"
                    style={{ "--phase": phase.color } as React.CSSProperties}
                  >
                    <Marker state={phase.state} color={phase.color} />
                    <div className="min-w-0">
                      <h3 className="text-[16px] font-medium leading-snug tracking-[-0.005em] text-ink">
                        {f.name}
                      </h3>
                      <p className="mt-1 text-[14px] leading-relaxed text-muted">
                        {f.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.section>
          ))}

          {/* 05 takes Ngeto-Ngete, the one colour the four phases above leave
              unused, so the roadmap finishes the set of five. No feature list
              here on purpose: the point is the part nobody has listed yet. */}
          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px -10% 0px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative pl-8 sm:pl-[140px]"
          >
            <span
              aria-hidden="true"
              className="absolute left-0 top-[13px] h-px w-5 sm:left-[92px] sm:w-8"
              style={{ backgroundColor: FINALE }}
            />

            <div className="absolute left-0 top-0 hidden sm:block">
              <span
                className="font-display text-[40px] leading-none tracking-[-0.02em]"
                style={{ color: FINALE }}
              >
                05
              </span>
            </div>

            <p
              className="font-mono text-[11px] uppercase tracking-[0.14em]"
              style={{ color: FINALE }}
            >
              <span className="sm:hidden">05 / </span>
              And much more
            </p>

            <h2 className="mt-4 max-w-[17ch] font-display text-[clamp(34px,6.2vw,64px)] font-normal leading-[0.99] tracking-[-0.03em] text-ink">
              The rest has not been written down
              <span className="whitespace-nowrap">
                {" "}yet
                <motion.span
                  aria-hidden="true"
                  className="ml-1.5 inline-block h-[0.72em] w-[3px] translate-y-[0.04em] align-baseline"
                  style={{ backgroundColor: FINALE }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
                  transition={{
                    duration: 1.8,
                    times: [0, 0.45, 0.5, 1],
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </span>
            </h2>

            <div className="mt-7 max-w-[52ch] space-y-4 text-[16px] leading-relaxed text-muted">
              <p>
                Everything above is a list, and a list is a small thing next to a
                language. The words that matter most are usually the ones nobody
                thought to record: what you call the rain that arrives before a
                harvest, the word for a debt that is never spoken about, the joke
                that only works in one village.
              </p>
              <p>
                Those do not arrive on a roadmap. They arrive when the people who
                speak them do.
              </p>
            </div>
          </motion.section>
        </div>
      </div>

      {/* Close. The black landmass on the home page pays off here. */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20% 0px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-32 border-t border-hairline pt-16"
      >
        <h2 className="max-w-[22ch] font-display text-[clamp(28px,4.4vw,46px)] font-normal leading-[1.04] tracking-[-0.025em] text-ink">
          Every black island is a language nobody has written down here yet.
        </h2>
        <p className="mt-6 max-w-[52ch] text-[16px] leading-relaxed text-muted">
          Adding a language means colouring in another part of this map. Sasak is
          first because it had to start somewhere. Indonesia follows, then Asia,
          then wherever the map keeps going.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-5">
          <Link
            href="/submit"
            className="inline-flex h-11 items-center rounded-[2px] bg-ink px-5 text-[15px] font-medium text-paper shadow-rest transition-all duration-150 hover:-translate-y-px hover:bg-ink-soft hover:shadow-lift"
          >
            Add a word
          </Link>
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.11em] text-muted underline decoration-hairline-strong underline-offset-[4px] transition-colors duration-150 hover:text-ink hover:decoration-ink"
          >
            Back to the dictionary
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
