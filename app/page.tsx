import { redirect } from "next/navigation";
import { COMPANIES, DEFAULT_TICKER } from "@/lib/config";

export default function RootPage() {
  const company = COMPANIES.find((c) => c.ticker === DEFAULT_TICKER)!;
  redirect(`/${company.slug}`);
}
} from "@/components/LastUpdated";
import { SentimentGauge } from "@/components/SentimentGauge";
import { getMuNewsDigest } from "@/lib/digest";
import { DEFAULT_DISCLAIMER } from "@/lib/config";

export const revalidate = 43200;

export default async function Home() {
  const digest = await getMuNewsDigest();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 pb-24 pt-10 sm:px-6">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-xs uppercase tracking-widest text-copper-400">
            Micron Technology · MU
          </p>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">MU 뉴스 대시보드</h1>
          <p className="text-sm text-warmgray-400">
            Micron Technology(MU) 관련 뉴스를 매일 자동 수집하고 AI로 요약·투자 심리를
            분석합니다. 실제 주가 예측이 아닌 참고용 뉴스 요약 서비스입니다.
          </p>
          <LastUpdated generatedAt={digest.generatedAt} />
        </header>

        {digest.ok ? (
          <>
            <section
              className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-graphite-900 p-6 shadow-panel"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(201,138,75,0.08), transparent 60%)",
              }}
            >
              <SentimentGauge tone={digest.tone} />
            </section>

            <section className="rounded-lg border-l-2 border-copper-500 bg-graphite-800 p-5 shadow-panel">
              <h2 className="mb-2 font-mono text-xs uppercase tracking-widest text-warmgray-500">
                오늘의 요약
              </h2>
              <p className="text-sm leading-relaxed text-warmgray-300">{digest.summary}</p>
            </section>

            <IssueList issues={digest.keyIssues} />
            <FactorsPanel factors={digest.factors} />
          </>
        ) : (
          <ErrorFallback error={digest.error} newsItems={digest.newsItems} />
        )}
      </main>

      <Disclaimer text={digest.ok ? digest.disclaimer : DEFAULT_DISCLAIMER} />
    </div>
  );
}
