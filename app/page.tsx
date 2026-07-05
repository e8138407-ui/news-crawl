import { redirect } from "next/navigation";
import { COMPANIES, DEFAULT_TICKER } from "@/lib/config";

export default function RootPage() {
  const company = COMPANIES.find((c) => c.ticker === DEFAULT_TICKER)!;
  redirect(`/${company.slug}`);
}
