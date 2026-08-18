"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { DialectMap, type MapLevel } from "./DialectMap";
import { RegionMark } from "@/components/entry/RegionMark";
import { fast } from "@/lib/motion";
import type { DialectKeyItem } from "@/types/database";

/**
 * Map, breadcrumb and dialect list are one control. The map holds the camera,
 * the URL holds the filter, and the two stay in step in both directions so the
 * back button behaves.
 */
export function DialectBrowser({
  items,
  selected,
}: {
  items: DialectKeyItem[];
  selected: string | null;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [hovered, setHovered] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [level, setLevel] = useState<MapLevel>(
    selected ? { kind: "region", slug: selected } : { kind: "country" },
  );

  // Someone pressed back, or landed on a shared filtered URL.
  useEffect(() => {
    if (selected) setLevel({ kind: "region", slug: selected });
    else setLevel((l) => (l.kind === "region" ? { kind: "island" } : l));
  }, [selected]);

  function setFilter(slug: string | null) {
    const next = new URLSearchParams(params.toString());
    if (slug) next.set("dialect", slug);
    else next.delete("dialect");
    const qs = next.toString();
    startTransition(() => router.push(qs ? `/?${qs}` : "/", { scroll: false }));
  }

  function pickRegion(slug: string) {
    if (selected === slug) {
      setLevel({ kind: "island" });
      setFilter(null);
    } else {
      setLevel({ kind: "region", slug });
      setFilter(slug);
    }
  }

  function goIsland() {
    setLevel({ kind: "island" });
    if (selected) setFilter(null);
  }

  function goCountry() {
    setLevel({ kind: "country" });
    if (selected) setFilter(null);
  }

  const active = hovered ?? selected;
  const activeItem = items.find((i) => i.region_slug === (level.kind === "region" ? level.slug : null));

  const crumbs: { label: string; onClick?: () => void; color?: string }[] = [
    { label: "Indonesia", onClick: level.kind === "country" ? undefined : goCountry },
    ...(level.kind === "country"
      ? []
      : [{ label: "Lombok", onClick: level.kind === "island" ? undefined : goIsland }]),
    ...(activeItem
      ? [{ label: activeItem.region_name, color: activeItem.region_color }]
      : []),
  ];

  return (
    <section className="grid items-start gap-10 border-t border-hairline pt-8 md:grid-cols-[minmax(0,1fr)_300px] md:gap-12">
      <div className="order-2 md:order-1">
        <nav aria-label="Map location" className="flex items-center gap-2">
          {crumbs.map((c, i) => (
            <span key={c.label} className="flex items-center gap-2">
              {i > 0 ? (
                <span aria-hidden="true" className="text-[11px] text-hairline-strong">
                  /
                </span>
              ) : null}
              {c.onClick ? (
                <button
                  onClick={c.onClick}
                  className="font-mono text-[11px] uppercase tracking-[0.11em] text-muted underline decoration-hairline-strong underline-offset-[3px] transition-colors duration-150 hover:text-ink hover:decoration-ink"
                >
                  {c.label}
                </button>
              ) : (
                <span
                  aria-current="true"
                  className="font-mono text-[11px] uppercase tracking-[0.11em]"
                  style={{ color: c.color ?? "var(--color-ink)" }}
                >
                  {c.label}
                </span>
              )}
            </span>
          ))}
        </nav>

        <div className="mt-3">
          <DialectMap
            items={items}
            level={level}
            hovered={hovered}
            onHover={setHovered}
            onSelectRegion={pickRegion}
            onEnterIsland={goIsland}
          />
        </div>

        <p className="mt-2 max-w-[62ch] text-[11px] leading-snug text-faint">
          Land from Natural Earth, Lombok coastline and regency outlines from
          OpenStreetMap. Dialect boundaries are approximate: real ones shift
          gradually and are still argued over. Everything in black is territory the
          dictionary does not cover yet.
        </p>
      </div>

      <div className="order-1 md:order-2">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.11em] text-faint">
            Five dialects
          </h2>
          <AnimatePresence>
            {selected ? (
              <motion.button
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                transition={fast}
                onClick={goIsland}
                className="font-mono text-[11px] uppercase tracking-[0.09em] text-muted underline decoration-hairline-strong underline-offset-[3px] transition-colors duration-150 hover:text-ink hover:decoration-ink"
              >
                Clear
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>

        <ul className="mt-4" data-pending={pending || undefined}>
          {items.map((r) => {
            const isActive = active === r.region_slug;
            return (
              <li key={r.region_slug} className="border-t border-hairline last:border-b">
                <button
                  onClick={() => pickRegion(r.region_slug)}
                  onMouseEnter={() => setHovered(r.region_slug)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(r.region_slug)}
                  onBlur={() => setHovered(null)}
                  aria-pressed={selected === r.region_slug}
                  className="group relative flex w-full items-stretch gap-3 py-3 pl-3 pr-2 text-left"
                >
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10"
                    style={{
                      backgroundColor: `color-mix(in oklab, ${r.region_color} 9%, transparent)`,
                    }}
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={fast}
                    initial={false}
                  />
                  <motion.span
                    aria-hidden="true"
                    className="w-[3px] shrink-0 origin-center"
                    style={{ backgroundColor: r.region_color }}
                    animate={{ scaleY: isActive ? 1 : 0.5 }}
                    transition={fast}
                    initial={false}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <RegionMark name={r.region_name} color={r.region_color} />
                      <span className="numeric-tabular font-mono text-[11px] text-faint">
                        {r.entry_count}
                      </span>
                    </span>
                    <span className="mt-1 block text-[12px] leading-snug text-faint">
                      {r.region_area}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
