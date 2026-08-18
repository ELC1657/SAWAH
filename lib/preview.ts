import type { EntryCard } from "@/types/database";
import { REGION_BY_SLUG } from "@/lib/regions";

/**
 * Preview mode. Active only while no real Supabase project is connected, so it
 * switches itself off the moment credentials land in .env.local.
 *
 * PLACEHOLDER CONTENT. These are common Sasak words, but the dialect tags,
 * examples and notes are assigned for layout purposes and are not linguistic
 * claims. Nothing here is ever written to the database.
 */
export const isPreviewMode = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return url === "" || url.includes("your-project-ref");
})();

type Seed = {
  term: string;
  gloss: string;
  id?: string;
  region: string;
  pos?: string;
  exTerm?: string;
  exGloss?: string;
  note?: string;
  /** Checked by a moderator, rather than promoted by the vote threshold. */
  editor?: boolean;
  score: number;
  handle: string;
  days: number;
};

const SEEDS: Seed[] = [
  { term: "beleq", editor: true, gloss: "big, large", id: "besar, agung", region: "meno-mene",
    pos: "adjective", exTerm: "Bale beleq", exGloss: "a big house",
    score: 14, handle: "senja-camar-419", days: 1 },
  { term: "aik", editor: true, gloss: "water", id: "air", region: "ngeno-ngene", pos: "noun",
    exTerm: "Aik nyet", exGloss: "cold water",
    note: "Turns up in place names all over Lombok.", score: 11, handle: "embun-penyu-072", days: 2 },
  { term: "bale", gloss: "house", id: "rumah", region: "meno-mene", pos: "noun",
    score: 9, handle: "karang-elang-538", days: 3 },
  { term: "inaq", gloss: "mother", id: "ibu", region: "kuto-kute", pos: "noun",
    score: 8, handle: "kabut-rusa-215", days: 4 },
  { term: "amaq", gloss: "father", id: "bapak, ayah", region: "kuto-kute", pos: "noun",
    score: 8, handle: "kabut-rusa-215", days: 4 },
  { term: "mangan", gloss: "to eat", id: "makan", region: "ngeno-ngene", pos: "verb",
    score: 7, handle: "pasir-bangau-903", days: 5 },
  { term: "lalo", gloss: "to go", id: "pergi", region: "ngeno-ngene", pos: "verb",
    score: 6, handle: "ombak-lumba-147", days: 6 },
  { term: "ndeq", editor: true, gloss: "no, not", id: "tidak, bukan", region: "meriaq-meriku",
    pos: "adverb", note: "The form shifts from one dialect to the next.",
    score: 6, handle: "sunyi-tupai-660", days: 7 },
  { term: "lueq", gloss: "many, a lot", id: "banyak", region: "meriaq-meriku",
    pos: "adjective", score: 5, handle: "sunyi-tupai-660", days: 8 },
  { term: "sopoq", gloss: "one", id: "satu", region: "ngeto-ngete", pos: "other",
    score: 5, handle: "perak-walet-331", days: 9 },
  { term: "gawah", gloss: "forest", id: "hutan", region: "kuto-kute", pos: "noun",
    score: 5, handle: "kabut-rusa-215", days: 11 },
  { term: "begawe", editor: true, gloss: "to hold a traditional feast", id: "mengadakan hajatan",
    region: "meno-mene", pos: "verb",
    note: "A customary term, used across the whole island.",
    score: 12, handle: "senja-camar-419", days: 13 },
  { term: "presean", editor: true, gloss: "Sasak duel fought with rattan stick and shield",
    id: "tarung pecut dan perisai khas Sasak", region: "ngeno-ngene", pos: "noun",
    score: 10, handle: "jingga-kunang-408", days: 15 },
  { term: "kodeq", gloss: "small", id: "kecil", region: "meno-mene", pos: "adjective",
    score: 4, handle: "karang-elang-538", days: 17 },
  { term: "tiang", editor: true, gloss: "I, me", id: "saya", region: "meno-mene", pos: "other",
    note: "Polite register. Everyday speech uses a different form.",
    score: 9, handle: "biru-merpati-284", days: 19 },
];

export const PREVIEW_ENTRIES: EntryCard[] = SEEDS.map((s, i) => {
  const region = REGION_BY_SLUG.get(s.region)!;
  return {
    id: `preview-${String(i + 1).padStart(2, "0")}`,
    term: s.term,
    gloss: s.gloss,
    gloss_secondary: s.id ?? null,
    part_of_speech: s.pos ?? null,
    example_term: s.exTerm ?? null,
    example_gloss: s.exGloss ?? null,
    note: s.note ?? null,
    status: "verified",
    editor_checked: s.editor ?? false,
    score: s.score,
    flag_count: 0,
    created_at: new Date(Date.now() - s.days * 86_400_000).toISOString(),
    region_slug: region.slug,
    region_name: region.name,
    region_area: region.area,
    region_color: region.color,
    submitter_handle: s.handle,
    submitted_by: `preview-user-${i}`,
    total_count: SEEDS.length,
  };
});

export function previewEntry(id: string): EntryCard | undefined {
  return PREVIEW_ENTRIES.find((e) => e.id === id);
}
