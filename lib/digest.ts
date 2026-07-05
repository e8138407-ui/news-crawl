import { unstable_cache } from "next/cache";
import { summarizeNews } from "./claude";
import { COMPANIES, getDigestCacheTag, REVALIDATE_SECONDS } from "./config";
import { fetchAllFeeds } from "./rss";
import type { Digest } from "./types";

/**
 * RSS 수집 + Claude 요약을 하나로 묶은 단일 진실 소스.
 * Anthropic SDK 호출은 Next의 patched fetch 캐시를 타지 않으므로,
 * unstable_cache로 함수 전체를 감싸 시간 기반(revalidate)과
 * 태그 기반(revalidateTag) 무효화를 모두 지원한다.
 * 종목별로 독립된 캐시 키/태그를 사용해 서로 영향을 주지 않는다.
 */
export function getNewsDigest(ticker: string): Promise<Digest> {
  const company = COMPANIES.find((c) => c.ticker === ticker);
  if (!company) {
    throw new Error(`Unknown ticker: ${ticker}`);
  }

  const cached = unstable_cache(
    async (): Promise<Digest> => {
      const newsItems = await fetchAllFeeds(company);
      return summarizeNews(newsItems, company);
    },
    [`news-digest-${ticker.toLowerCase()}`],
    { revalidate: REVALIDATE_SECONDS, tags: [getDigestCacheTag(ticker)] }
  );

  return cached();
}
