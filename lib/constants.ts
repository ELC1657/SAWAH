/**
 * Mirrors of the thresholds defined in supabase/migrations/0002_functions.sql.
 * These exist for UI copy only. The database is what actually enforces them.
 */
export const PROMOTE_THRESHOLD = 5;
export const REJECT_THRESHOLD = -3;
export const RATE_LIMIT_HOURLY = 8;
export const RATE_LIMIT_DAILY = 30;

/** Default language pair. Additional pairs are rows, not code. */
export const DEFAULT_DICTIONARY = "sasak-en";

export const PAGE_SIZE = 30;

/** A human cannot read the form, think, and submit in under this. A bot can. */
export const MIN_FORM_DWELL_MS = 3000;

export const PART_OF_SPEECH = [
  { value: "noun", label: "Noun" },
  { value: "verb", label: "Verb" },
  { value: "adjective", label: "Adjective" },
  { value: "adverb", label: "Adverb" },
  { value: "phrase", label: "Phrase" },
  { value: "other", label: "Other" },
] as const;

export const FLAG_REASONS = [
  { value: "wrong_translation", label: "The translation is wrong" },
  { value: "wrong_region", label: "The dialect is wrong" },
  { value: "spam", label: "Spam" },
  { value: "offensive", label: "Offensive or abusive" },
  { value: "other", label: "Something else" },
] as const;
