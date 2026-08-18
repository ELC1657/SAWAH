import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import { Masthead } from "@/components/ui/Masthead";
import { PreviewBanner } from "@/components/ui/PreviewBanner";
import { isPreviewMode } from "@/lib/preview";
import { getSessionProfile } from "@/lib/supabase/session";
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
    "A Sasak to English dictionary built by its speakers, one word and one dialect at a time.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getSessionProfile();

  return (
    <html lang="en" className={`${fraunces.variable} ${plexMono.variable}`}>
      <body className="min-h-dvh antialiased">
        {isPreviewMode ? <PreviewBanner /> : null}
        <Masthead profile={profile} />
        <main className="mx-auto w-full max-w-[1120px] px-6 pb-32">{children}</main>
        <footer className="border-t border-hairline">
          <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-2 px-6 py-10 text-[13px] text-faint sm:flex-row sm:items-center sm:justify-between">
            <p>
              SAWAH gathers a language from the people who speak it. Every entry is
              reviewed before it appears.
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.09em]">
              Sasak · English
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
