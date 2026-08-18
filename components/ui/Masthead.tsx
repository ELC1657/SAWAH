import Link from "next/link";
import { REGIONS } from "@/lib/regions";
import type { Profile } from "@/types/database";
import { AccountMenu } from "./AccountMenu";

/**
 * The wordmark carries the five dialect colours as a single rule. It is the
 * only decorative element in the shell, and it is the product's actual data.
 */
function Wordmark() {
  return (
    <Link href="/" className="group inline-flex flex-col gap-1.5" aria-label="SAWAH, home">
      <span className="font-display text-[22px] font-semibold leading-none tracking-[0.02em] text-ink">
        SAWAH
      </span>
      <span className="flex h-[3px] w-[88px] overflow-hidden" aria-hidden="true">
        {REGIONS.map((r) => (
          <span
            key={r.slug}
            className="h-full flex-1 transition-[flex-grow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:[&:nth-child(3)]:flex-[1.6]"
            style={{ backgroundColor: r.color }}
          />
        ))}
      </span>
    </Link>
  );
}

export function Masthead({ profile }: { profile: Profile | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between gap-6 px-6">
        <Wordmark />

        <nav className="flex items-center gap-1">
          <Link
            href="/submit"
            className="rounded-[2px] px-3 py-2 text-[14px] text-muted transition-colors duration-150 hover:bg-paper-sunk hover:text-ink"
          >
            Add a word
          </Link>
          {profile?.role === "admin" ? (
            <Link
              href="/admin"
              className="rounded-[2px] px-3 py-2 text-[14px] text-muted transition-colors duration-150 hover:bg-paper-sunk hover:text-ink"
            >
              Review
            </Link>
          ) : null}
          <AccountMenu profile={profile} />
        </nav>
      </div>
    </header>
  );
}
