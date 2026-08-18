import { cache } from "react";
import { createClient } from "./server";
import type { Profile } from "@/types/database";

/**
 * Deduped per request. Returns null rather than throwing so public pages can
 * render for signed out visitors without branching everywhere.
 */
export const getSessionProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data as Profile) ?? null;
});

export const requireAdmin = cache(async (): Promise<Profile | null> => {
  const profile = await getSessionProfile();
  return profile?.role === "admin" ? profile : null;
});
