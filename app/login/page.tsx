import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/supabase/session";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const profile = await getSessionProfile();

  if (profile) redirect(next && next.startsWith("/") ? next : "/");

  return (
    <div className="mx-auto max-w-[440px] pt-20">
      <h1 className="font-display text-[28px] font-normal leading-[1.15] tracking-[-0.015em] text-ink">
        Sign in to help build it
      </h1>
      <p className="mt-4 max-w-[38ch] text-[15px] leading-relaxed text-muted">
        We send a single use link to your email. There is no password to remember,
        and your address never appears anywhere in the dictionary.
      </p>

      <LoginForm next={next} initialError={error} />
    </div>
  );
}
