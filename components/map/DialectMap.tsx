"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import {
  INDONESIA_BBOX,
  INDONESIA_PATH,
  LOMBOK_BBOX,
  REGION_GEO,
  REGION_GEO_BY_SLUG,
  VIEWPORT,
  bboxCentre,
  fitBBox,
  toViewport,
  type BBox,
} from "@/lib/map/atlas";
import type { DialectKeyItem } from "@/types/database";

export type MapLevel =
  | { kind: "country" }
  | { kind: "island" }
  | { kind: "region"; slug: string };

/** Camera move. Long enough to read as travel, short enough not to wait on. */
const CAMERA = { duration: 0.62, ease: [0.32, 0.72, 0, 1] } as const;
const QUICK = { duration: 0.18, ease: [0.22, 1, 0.36, 1] } as const;

function bboxFor(level: MapLevel): BBox {
  if (level.kind === "country") return INDONESIA_BBOX;
  if (level.kind === "island") return LOMBOK_BBOX;
  return REGION_GEO_BY_SLUG.get(level.slug)?.bbox ?? LOMBOK_BBOX;
}

export function DialectMap({
  items,
  level,
  hovered,
  onHover,
  onSelectRegion,
  onEnterIsland,
}: {
  items: DialectKeyItem[];
  level: MapLevel;
  hovered: string | null;
  onHover: (slug: string | null) => void;
  onSelectRegion: (slug: string) => void;
  onEnterIsland: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const bySlug = useMemo(() => new Map(items.map((i) => [i.region_slug, i])), [items]);
  const camera = useMemo(() => fitBBox(bboxFor(level)), [level]);

  const atCountry = level.kind === "country";
  const selected = level.kind === "region" ? level.slug : null;
  const active = hovered ?? selected;

  // Where Lombok sits on screen while we are looking at the whole country.
  const marker = useMemo(() => {
    const f = fitBBox(INDONESIA_BBOX);
    const [x, y] = toViewport(bboxCentre(LOMBOK_BBOX), f);
    return { x, y };
  }, []);

  const totalEntries = items.reduce((n, i) => n + Number(i.entry_count), 0);

  return (
    <svg
      viewBox={`0 0 ${VIEWPORT.width} ${VIEWPORT.height}`}
      className="h-auto w-full select-none"
      role="group"
      aria-label="Map of Indonesia. Sasak dialects are recorded on Lombok."
    >
      <motion.g
        initial={false}
        animate={{ x: camera.x, y: camera.y, scale: camera.s }}
        transition={reduceMotion ? { duration: 0 } : CAMERA}
        // Framer manages transform-origin itself and defaults to the centre of
        // the element's own bounding box. The camera maths assumes the viewBox
        // origin, so both of these have to be pinned explicitly.
        style={{ originX: 0, originY: 0, transformBox: "view-box" }}
      >
        {/* Everywhere without a dictionary yet. */}
        <path d={INDONESIA_PATH} fill="var(--color-ink)" fillRule="evenodd" />

        {REGION_GEO.map((geo) => {
          const meta = bySlug.get(geo.slug);
          if (!meta) return null;

          const isActive = active === geo.slug;
          const dimmed = !atCountry && active !== null && !isActive;

          return (
            <motion.path
              key={geo.slug}
              d={geo.path}
              fill={meta.region_color}
              stroke="var(--color-paper)"
              strokeWidth={atCountry ? 0 : 2.5}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              role={atCountry ? undefined : "button"}
              tabIndex={atCountry ? -1 : 0}
              aria-hidden={atCountry || undefined}
              aria-pressed={selected === geo.slug}
              aria-label={`${meta.region_name}, ${meta.entry_count} entries. ${meta.region_area}`}
              className={
                atCountry
                  ? "pointer-events-none"
                  : "cursor-pointer outline-none focus-visible:stroke-ink"
              }
              animate={{ opacity: dimmed ? 0.24 : 1 }}
              transition={QUICK}
              onMouseEnter={() => !atCountry && onHover(geo.slug)}
              onMouseLeave={() => !atCountry && onHover(null)}
              onFocus={() => !atCountry && onHover(geo.slug)}
              onBlur={() => !atCountry && onHover(null)}
              onClick={() => !atCountry && onSelectRegion(geo.slug)}
              onKeyDown={(e) => {
                if (!atCountry && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onSelectRegion(geo.slug);
                }
              }}
            />
          );
        })}
      </motion.g>

      {/* Lombok is under half a percent of the country, so at this range it
          needs to be pointed at rather than merely coloured. */}
      <motion.g
        initial={false}
        animate={{ opacity: atCountry ? 1 : 0 }}
        transition={QUICK}
        className={atCountry ? "cursor-pointer" : "pointer-events-none"}
        onClick={() => atCountry && onEnterIsland()}
        role={atCountry ? "button" : undefined}
        tabIndex={atCountry ? 0 : -1}
        aria-label={`Zoom to Lombok, ${totalEntries} entries across five dialects`}
        onKeyDown={(e) => {
          if (atCountry && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onEnterIsland();
          }
        }}
      >
        <motion.circle
          cx={marker.x}
          cy={marker.y}
          r={16}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth={1.25}
          animate={
            atCountry && !reduceMotion ? { r: [16, 21, 16], opacity: [0.9, 0.15, 0.9] } : {}
          }
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle cx={marker.x} cy={marker.y} r={16} fill="transparent" />
        <line
          x1={marker.x + 14}
          y1={marker.y - 12}
          x2={marker.x + 52}
          y2={marker.y - 44}
          stroke="var(--color-ink)"
          strokeWidth={1}
        />
        <text
          x={marker.x + 56}
          y={marker.y - 46}
          className="fill-ink font-mono text-[13px] uppercase"
          style={{ letterSpacing: "0.1em" }}
        >
          Lombok
        </text>
        <text
          x={marker.x + 56}
          y={marker.y - 30}
          className="fill-faint font-mono text-[11px]"
        >
          5 dialects
        </text>
      </motion.g>
    </svg>
  );
}
