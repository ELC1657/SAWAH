"use client";

import { motion } from "motion/react";
import { fast } from "@/lib/motion";
import type { Region } from "@/types/database";

/**
 * A dropdown would hide the one piece of information a contributor most needs
 * to get right, and would throw away the colour system entirely. Each dialect
 * is a card carrying its own rule and its own area description.
 */
export function DialectPicker({
  regions,
  value,
  onChange,
  error,
}: {
  regions: Region[];
  value: string;
  onChange: (slug: string) => void;
  error?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="font-mono text-[11px] uppercase tracking-[0.09em] text-muted">
        Which dialect is it from
      </legend>

      <div className="mt-1 grid gap-2 sm:grid-cols-2">
        {regions.map((r) => {
          const active = value === r.slug;
          return (
            <label
              key={r.slug}
              className="relative cursor-pointer"
              style={{ "--region": r.color } as React.CSSProperties}
            >
              <input
                type="radio"
                name="regionSlug"
                value={r.slug}
                checked={active}
                onChange={() => onChange(r.slug)}
                className="peer sr-only"
              />
              <motion.span
                animate={{
                  backgroundColor: active
                    ? `color-mix(in oklab, ${r.color} 10%, #FFFFFF)`
                    : "#FFFFFF",
                }}
                transition={fast}
                className="flex items-start gap-3 rounded-[4px] border border-hairline p-3 transition-[border-color,box-shadow] duration-150 hover:border-hairline-strong peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
                style={{ borderColor: active ? r.color : undefined }}
              >
                <motion.span
                  aria-hidden="true"
                  className="mt-0.5 w-[3px] shrink-0 self-stretch"
                  style={{ backgroundColor: r.color }}
                  animate={{ scaleY: active ? 1 : 0.6, opacity: active ? 1 : 0.55 }}
                  transition={fast}
                />
                <span className="min-w-0">
                  <span
                    className="block font-mono text-[11px] font-medium uppercase tracking-[0.11em]"
                    style={{ color: r.color }}
                  >
                    {r.name}
                  </span>
                  <span className="mt-1 block text-[12px] leading-snug text-faint">
                    {r.area}
                  </span>
                </span>
              </motion.span>
            </label>
          );
        })}
      </div>

      {error ? <p className="text-[13px] text-danger">{error}</p> : null}
    </fieldset>
  );
}
