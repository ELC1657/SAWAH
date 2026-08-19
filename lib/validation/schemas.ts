import { z } from "zod";
import { FLAG_REASONS, PART_OF_SPEECH } from "@/lib/constants";

const posValues = PART_OF_SPEECH.map((p) => p.value) as [string, ...string[]];
const flagValues = FLAG_REASONS.map((f) => f.value) as [string, ...string[]];

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max} characters maximum`)
    .optional()
    .transform((v) => (v === "" ? undefined : v));

export const emailSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export const submissionSchema = z.object({
  term: z
    .string()
    .trim()
    .min(1, "The Sasak word cannot be empty")
    .max(80, "80 characters maximum"),
  gloss: z
    .string()
    .trim()
    .min(1, "An English translation is required")
    .max(160, "160 characters maximum"),
  glossSecondary: z
    .string()
    .trim()
    .min(1, "An Indonesian translation is required")
    .max(160, "160 characters maximum"),
  regionSlug: z.string().min(1, "Choose the dialect this word comes from"),
  partOfSpeech: z.enum(posValues).optional(),
  exampleTerm: optionalText(240),
  exampleGloss: optionalText(240),
  note: optionalText(400),

  /* bot traps, never shown to a human */
  website: z.string().max(0, "Submission rejected"),
  renderedAt: z.coerce.number().int().nonnegative(),
});

export const flagSchema = z.object({
  entryId: z.uuid(),
  reason: z.enum(flagValues),
  detail: optionalText(400),
});

export const voteSchema = z.object({
  entryId: z.uuid(),
  value: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
});

export const moderationSchema = z.object({
  entryId: z.uuid(),
  decision: z.enum(["verified", "rejected", "pending"]),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
