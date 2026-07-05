import Link from "next/link";
import { COMPANIES } from "@/lib/config";

export function CompanyNav({ activeSlug }: { activeSlug: string }) {
  return (
    <nav className="flex flex-wrap gap-2">
      {COMPANIES.map((company) => {
        const isActive = company.slug === activeSlug;
        return (
          <Link
            key={company.slug}
            href={`/${company.slug}`}
            className={
              isActive
                ? "rounded-full border border-copper-500 bg-copper-500/20 px-3 py-1 font-mono text-xs text-copper-400"
                : "rounded-full border border-white/[0.08] px-3 py-1 font-mono text-xs text-warmgray-400 hover:border-copper-500/40 hover:text-warmgray-300"
            }
          >
            {company.ticker}
          </Link>
        );
      })}
    </nav>
  );
}
