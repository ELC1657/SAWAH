"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/supabase/session";

export type HandleState = { status: "idle" | "error" | "success"; message?: string };

const HANDLE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** One change, self service. The row is locked by RLS after that. */
export async function changeHandle(
  _prev: HandleState,
  formData: FormData,
): Promise<HandleState> {
  const profile = await getSessionProfile();
  if (!profile) return { status: "error", message: "Sign in first." };
  if (profile.handle_changed) {
    return { status: "error", message: "A handle can only be changed once." };
  }

  const handle = String(formData.get("handle") ?? "").trim().toLowerCase();

  if (handle.length < 3 || handle.length > 24) {
    return { status: "error", message: "Between 3 and 24 characters." };
  }
  if (!HANDLE.test(handle)) {
    return { status: "error", message: "Lowercase letters, numbers and hyphens only." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ handle, handle_changed: true })
    .eq("id", profile.id);

  if (error) {
    if (error.code === "23505") return { status: "error", message: "That handle is taken." };
    return { status: "error", message: "Could not save that." };
  }

  revalidatePath("/", "layout");
  return { status: "success", message: "Handle updated." };
}
