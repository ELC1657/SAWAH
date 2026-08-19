"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/supabase/session";
import { submissionSchema } from "@/lib/validation/schemas";
import {
  DEFAULT_DICTIONARY,
  MIN_FORM_DWELL_MS,
  RATE_LIMIT_HOURLY,
} from "@/lib/constants";

export type SubmitState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Enough of the created row to show it back to the person who wrote it. */
  created?: {
    id: string;
    term: string;
    gloss: string;
    glossSecondary: string | null;
    regionName: string;
    regionColor: string;
  };
};

/** FormData gives "" for untouched optional fields, zod wants them absent. */
function opt(v: FormDataEntryValue | null) {
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" ? undefined : s;
}

export async function submitEntry(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const profile = await getSessionProfile();
  if (!profile) {
    return { status: "error", message: "Sign in before adding a word." };
  }

  const parsed = submissionSchema.safeParse({
    term: formData.get("term") ?? "",
    gloss: formData.get("gloss") ?? "",
    glossSecondary: formData.get("glossSecondary") ?? "",
    regionSlug: formData.get("regionSlug") ?? "",
    partOfSpeech: opt(formData.get("partOfSpeech")),
    exampleTerm: opt(formData.get("exampleTerm")),
    exampleGloss: opt(formData.get("exampleGloss")),
    note: opt(formData.get("note")),
    website: formData.get("website") ?? "",
    renderedAt: formData.get("renderedAt") ?? "0",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    // The honeypot is invisible, so a human can never trip it. Report nothing
    // useful back to whatever filled it in.
    if (fieldErrors.website) {
      return { status: "error", message: "Submission rejected." };
    }
    return { status: "error", fieldErrors, message: "Check the fields above." };
  }

  const data = parsed.data;

  // Nobody reads a form and composes a dictionary entry in three seconds.
  if (Date.now() - data.renderedAt < MIN_FORM_DWELL_MS) {
    return { status: "error", message: "That was too quick. Try again." };
  }

  const supabase = await createClient();

  const { data: region } = await supabase
    .from("regions")
    .select("id,name,color,dictionary_id,dictionaries!inner(slug)")
    .eq("slug", data.regionSlug)
    .eq("dictionaries.slug", DEFAULT_DICTIONARY)
    .maybeSingle();

  if (!region) {
    return {
      status: "error",
      fieldErrors: { regionSlug: "Unknown dialect." },
      message: "Check the fields above.",
    };
  }

  const { data: inserted, error } = await supabase
    .from("entries")
    .insert({
      dictionary_id: region.dictionary_id,
      region_id: region.id,
      term: data.term,
      gloss: data.gloss,
      gloss_secondary: data.glossSecondary,
      part_of_speech: data.partOfSpeech ?? null,
      example_term: data.exampleTerm ?? null,
      example_gloss: data.exampleGloss ?? null,
      note: data.note ?? null,
      submitted_by: profile.id,
    })
    .select("id,term,gloss,gloss_secondary")
    .single();

  if (error) {
    // These rules live in the database, so they hold even if someone skips
    // this action and posts straight at PostgREST.
    if (error.message.includes("SAWAH_RATE_LIMIT_HOUR")) {
      return {
        status: "error",
        message: `That is ${RATE_LIMIT_HOURLY} words in an hour. Come back shortly, the queue is not going anywhere.`,
      };
    }
    if (error.message.includes("SAWAH_RATE_LIMIT_DAY")) {
      return {
        status: "error",
        message: "You have reached today's limit. Thank you, genuinely. Try again tomorrow.",
      };
    }
    if (error.code === "23505") {
      return {
        status: "error",
        fieldErrors: { term: "This word already exists for this dialect." },
        message: "Check the fields above.",
      };
    }
    return { status: "error", message: "Could not save that. Try again." };
  }

  // "layout" so an admin's review dot appears without a hard refresh
  revalidatePath("/", "layout");
  revalidatePath("/contributions");

  return {
    status: "success",
    created: {
      id: inserted.id,
      term: inserted.term,
      gloss: inserted.gloss,
      glossSecondary: inserted.gloss_secondary,
      regionName: region.name,
      regionColor: region.color,
    },
  };
}
