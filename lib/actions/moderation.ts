"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/session";
import { moderationSchema } from "@/lib/validation/schemas";

export type ModerationState = { status: "idle" | "error"; message?: string };

/**
 * A moderator decision. Writing reviewed_by is what separates an editor checked
 * entry from one the vote threshold promoted, so it is set here and nowhere
 * else. The database guard refuses this update for anyone who is not an admin.
 */
export async function moderateEntry(
  _prev: ModerationState,
  formData: FormData,
): Promise<ModerationState> {
  const admin = await requireAdmin();
  if (!admin) return { status: "error", message: "Not authorised." };

  const parsed = moderationSchema.safeParse({
    entryId: formData.get("entryId"),
    decision: formData.get("decision"),
  });
  if (!parsed.success) return { status: "error", message: "Bad request." };

  const { entryId, decision } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from("entries")
    .update({
      status: decision,
      reviewed_by: decision === "pending" ? null : admin.id,
      reviewed_at: decision === "pending" ? null : new Date().toISOString(),
    })
    .eq("id", entryId);

  if (error) return { status: "error", message: "Could not save that." };

  // "layout" so the masthead dot recounts, not just the page body
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  revalidatePath(`/entry/${entryId}`);
  return { status: "idle" };
}

/** Close a report without changing the entry, or after acting on it. */
export async function resolveFlag(
  _prev: ModerationState,
  formData: FormData,
): Promise<ModerationState> {
  const admin = await requireAdmin();
  if (!admin) return { status: "error", message: "Not authorised." };

  const flagId = String(formData.get("flagId") ?? "");
  const outcome = String(formData.get("outcome") ?? "");
  if (!flagId || !["resolved", "dismissed"].includes(outcome)) {
    return { status: "error", message: "Bad request." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("flags")
    .update({ status: outcome })
    .eq("id", flagId);

  if (error) return { status: "error", message: "Could not save that." };

  revalidatePath("/", "layout");
  revalidatePath("/admin/flags");
  revalidatePath("/admin");
  return { status: "idle" };
}
