import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const rawNext = searchParams.get("next") ?? "/";
  // only ever redirect within this site
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const base =
    process.env.NODE_ENV === "development" || !forwardedHost
      ? origin
      : `https://${forwardedHost}`;

  const fail = (reason: string) =>
    NextResponse.redirect(`${base}/login?error=${encodeURIComponent(reason)}`);

  if (!code && !(tokenHash && type)) return fail("missing_code");

  // Build the response FIRST, then let Supabase write its session cookies onto
  // this exact object. Cookies set through next/headers are attached to the
  // response Next.js is constructing, and are lost the moment we return a
  // different NextResponse instead. That drops the session silently: the
  // exchange succeeds and the user still arrives signed out.
  const response = NextResponse.redirect(`${base}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // PKCE links carry a code and need the verifier cookie from the browser that
  // asked. token_hash links verify on their own, so a link opened on a
  // different device still works.
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ type: type!, token_hash: tokenHash! });

  if (error) return fail(error.message.slice(0, 80));

  return response;
}
