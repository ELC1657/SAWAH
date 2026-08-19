import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import { Masthead } from "@/components/ui/Masthead";
import { PreviewBanner } from "@/components/ui/PreviewBanner";
import { isPreviewMode } from "@/lib/preview";
import { getSessionProfile } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { REGIONS } from "@/lib/regions";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: {
    default: "SAWAH",
    template: "%s · SAWAH",
  },
  description:
    "SAWAH records languages that were never written down, starting with Sasak: three million speakers on Lombok, almost nothing on paper. Every word in English and Indonesian, written by the people who speak it.",
};

const ROADMAP_TICKS = REGIONS.map((r) => r.color);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getSessionProfile();

  // Anything sitting unverified, plus anything reported. Only ever counted for
  // an admin: nobody else sees the link, so nobody else pays for the query.
  let awaiting = 0;
  if (profile?.role === "admin") {
    const supabase = await createClient();
    const [pending, reports] = await Promise.all([
      supabase
        .from("entries")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("flags")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
    ]);
    awaiting = (pending.count ?? 0) + (reports.count ?? 0);
  }

  return (
    <html lang="en" className={`${fraunces.variable} ${plexMono.variable}`}>
      <body className="min-h-dvh antialiased">
        {isPreviewMode ? <PreviewBanner /> : null}
        <Masthead profile={profile} awaiting={awaiting} />
        <main className="mx-auto w-full max-w-[1120px] px-6 pb-32">{children}</main>
        <footer className="border-t border-hairline">
          <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-2 px-6 py-10 text-[13px] text-faint sm:flex-row sm:items-center sm:justify-between">
            <p>SAWAH gathers a language from the people who speak it.</p>
            <Link
              href="/roadmap"
              className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.09em] text-muted transition-colors duration-150 hover:text-ink"
            >
              {/* The five dialect colours, shrunk to a bullet, as the tell that
                  this leads somewhere about the whole project. */}
              <span className="flex h-[3px] w-6 overflow-hidden" aria-hidden="true">
                {ROADMAP_TICKS.map((c) => (
                  <span key={c} className="h-full flex-1" style={{ backgroundColor: c }} />
                ))}
              </span>
              Development roadmap
              <span
                aria-hidden="true"
                className="transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5"
              >
                &rarr;
              </span>
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
