import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/supabase/session";
import { SubmitForm } from "@/components/submit/SubmitForm";
import { DEFAULT_DICTIONARY, RATE_LIMIT_HOURLY } from "@/lib/constants";
import type { Region } from "@/types/database";

export const metadata: Metadata = { title: "Add a word" };

export default async function SubmitPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?next=/submit");

  const supabase = await createClient();
  const { data } = await supabase
    .from("regions")
    .select("*, dictionaries!inner(slug)")
    .eq("dictionaries.slug", DEFAULT_DICTIONARY)
    .order("sort_order");

  const regions = (data ?? []) as Region[];

  return (
    <div className="mx-auto max-w-[720px] pt-12">
      <h1 className="font-mono text-[12px] uppercase tracking-[0.14em] text-faint">
        Add a word
      </h1>
      <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-ink-soft">
        One word or phrase at a time. Everything you send starts in the review
        queue, and it is credited to{" "}
        <span className="font-mono text-[14px] text-ink">{profile.handle}</span>,
        never to your email.
      </p>

      <div className="mt-10">
        <SubmitForm regions={regions} />
      </div>

      <p className="mt-10 border-t border-hairline pt-5 text-[13px] leading-relaxed text-faint">
        Up to {RATE_LIMIT_HOURLY} words an hour. The limit exists to keep the queue
        readable, not to slow you down.
      </p>
    </div>
  );
}
