/**
 * Hand maintained to match supabase/migrations. Regenerate with:
 *   npx supabase gen types typescript --project-id <ref> > types/database.ts
 */
export type EntryStatus = "pending" | "verified" | "rejected";
export type FlagStatus = "open" | "resolved" | "dismissed";
export type FlagReason =
  | "wrong_translation"
  | "wrong_region"
  | "spam"
  | "offensive"
  | "other";

export type Region = {
  id: number;
  dictionary_id: number;
  slug: string;
  name: string;
  area: string;
  color: string;
  sort_order: number;
};

export type Dictionary = {
  id: number;
  slug: string;
  name: string;
  source_language: string;
  target_language: string;
  source_label: string;
  target_label: string;
  secondary_language: string | null;
  secondary_label: string | null;
  is_active: boolean;
  sort_order: number;
};

export type Profile = {
  id: string;
  handle: string;
  role: "member" | "admin";
  handle_changed: boolean;
  created_at: string;
};

/** Shape returned by the search_entries and suggest_terms RPCs. */
export type EntryCard = {
  id: string;
  term: string;
  gloss: string;
  gloss_secondary: string | null;
  part_of_speech: string | null;
  example_term: string | null;
  example_gloss: string | null;
  note: string | null;
  status: EntryStatus;
  /** Verified by a moderator rather than by reaching the vote threshold. */
  editor_checked: boolean;
  score: number;
  flag_count: number;
  created_at: string;
  region_slug: string;
  region_name: string;
  region_area: string;
  region_color: string;
  submitter_handle: string;
  submitted_by: string;
  total_count: number;
};

export type Suggestion = {
  term: string;
  region_color: string;
  region_slug: string;
};

/** Shape returned by the region_counts RPC, used by the map and dialect list. */
export type DialectKeyItem = {
  region_slug: string;
  region_name: string;
  region_area: string;
  region_color: string;
  entry_count: number;
};
