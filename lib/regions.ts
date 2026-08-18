/**
 * Build-time mirror of the seeded regions so the shell can paint dialect colour
 * before any query resolves. The database stays authoritative: anything rendered
 * from a query uses the colour that came back with the row.
 */
export type RegionConfig = {
  slug: string;
  name: string;
  area: string;
  color: string;
};

export const REGIONS: RegionConfig[] = [
  {
    slug: "kuto-kute",
    name: "Kuto-Kute",
    area: "North Lombok: Bayan, Tanjung, the slopes of Rinjani",
    color: "#2E4A63",
  },
  {
    slug: "ngeto-ngete",
    name: "Ngeto-Ngete",
    area: "Northeast Lombok: Suela, Sembalun",
    color: "#3F6F6A",
  },
  {
    slug: "ngeno-ngene",
    name: "Ngeno-Ngene",
    area: "East Lombok and parts of Central Lombok",
    color: "#B4553A",
  },
  {
    slug: "meno-mene",
    name: "Meno-Mene",
    area: "Central and West Lombok: Praya, Mataram",
    color: "#4F7A46",
  },
  {
    slug: "meriaq-meriku",
    name: "Meriaq-Meriku",
    area: "Southern Central Lombok: Pujut, Praya Barat",
    color: "#B8862F",
  },
];

export const REGION_BY_SLUG = new Map(REGIONS.map((r) => [r.slug, r]));

export function regionColor(slug: string | null | undefined): string {
  if (!slug) return "#6B6660";
  return REGION_BY_SLUG.get(slug)?.color ?? "#6B6660";
}
