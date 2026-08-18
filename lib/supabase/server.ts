import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Request scoped client carrying the caller's session, so every query runs
 * under that user's RLS policies. Never cache or hoist this.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component. The middleware refreshes the
            // session instead, so this is safe to swallow.
          }
        },
      },
    },
  );
}
