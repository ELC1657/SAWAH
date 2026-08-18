import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FlagRow, type FlagItem } from "@/components/admin/FlagRow";

export const metadata: Metadata = { title: "Reports" };

export default async function AdminFlagsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("flags")
    .select(
      "id,reason,detail,status,created_at,entries(id,term,gloss,status,regions(name,color)),profiles!flags_user_id_fkey(handle)",
    )
    .eq("status", "open")
    .order("created_at", { ascending: true });

  const flags = (data ?? []) as unknown as FlagItem[];

  return (
    <div className="mx-auto max-w-[760px]">
      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.09em] text-faint">
        {flags.length} open
      </p>

      {flags.length === 0 ? (
        <div className="mt-8 rounded-[6px] border border-dashed border-hairline-strong px-8 py-16 text-center">
          <p className="font-display text-[22px] text-ink">Nothing reported</p>
          <p className="mx-auto mt-2 max-w-[44ch] text-[15px] leading-relaxed text-muted">
            When someone flags an entry it lands here, and that entry stops being
            eligible for automatic promotion until you close the report.
          </p>
          <Link
            href="/admin"
            className="mt-6 inline-flex font-mono text-[11px] uppercase tracking-[0.09em] text-muted underline decoration-hairline-strong underline-offset-[3px] hover:text-ink"
          >
            Back to the queue
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {flags.map((f) => (
            <FlagRow key={f.id} flag={f} />
          ))}
        </div>
      )}
    </div>
  );
}
