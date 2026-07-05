import type { NewsItem } from "@/lib/types";

export function ErrorFallback({ error, newsItems }: { error: string; newsItems: NewsItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-brick-500/40 bg-brick-500/10 p-5">
        <p className="text-sm font-medium text-brick-400">AI 요약을 불러오지 못했습니다</p>
        <p className="mt-1 text-sm text-warmgray-400">{error}</p>
        <p className="mt-1 text-xs text-warmgray-500">
          아래는 자동 수집된 원본 뉴스 헤드라인입니다. (투자 심리 분석 없이 제목만 제공)
        </p>
      </div>

      {newsItems.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {newsItems.map((item, i) => (
            <li key={item.link + i}>
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-baseline gap-3 rounded-md border border-white/[0.08] bg-graphite-800 px-4 py-3 text-sm text-warmgray-300 hover:border-copper-500/40 hover:text-white"
              >
                <span className="shrink-0 font-mono text-xs text-warmgray-500">{item.source}</span>
                <span>{item.title}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-warmgray-500">현재 표시할 뉴스 헤드라인이 없습니다.</p>
      )}
    </div>
  );
}
