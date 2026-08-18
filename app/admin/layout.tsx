import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/session";

/**
 * Server side gate. Non-admins get a 404 rather than a redirect, so the
 * existence of the queue is not advertised to people who cannot use it.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) notFound();

  return (
    <div className="pt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-hairline pb-4">
        <h1 className="font-mono text-[12px] uppercase tracking-[0.14em] text-faint">
          Moderation
        </h1>
        <nav className="flex items-center gap-5">
          <Link
            href="/admin"
            className="font-mono text-[11px] uppercase tracking-[0.09em] text-muted transition-colors duration-150 hover:text-ink"
          >
            Queue
          </Link>
          <Link
            href="/admin/flags"
            className="font-mono text-[11px] uppercase tracking-[0.09em] text-muted transition-colors duration-150 hover:text-ink"
          >
            Reports
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
