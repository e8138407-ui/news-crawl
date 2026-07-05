export interface RssSource {
  name: string;
  url: string;
}

export const RSS_SOURCES: RssSource[] = [
  {
    name: "Google News",
    url: "https://news.google.com/rss/search?q=Micron+Technology+OR+MU+stock&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "Yahoo Finance",
    url: "https://finance.yahoo.com/rss/headline?s=MU",
  },
];

export const FRESH_WINDOW_HOURS = 24;
export const FALLBACK_WINDOW_HOURS = 48;
export const MIN_ITEMS_BEFORE_WIDENING = 6;
export const MAX_ITEMS = 18;

export const FEED_FETCH_TIMEOUT_MS = 8000;
export const CLAUDE_TIMEOUT_MS = 30000;

// 캐시/재검증 주기 (초). ISR revalidate와 unstable_cache에서 공유.
export const REVALIDATE_SECONDS = 43200; // 12시간

export const DIGEST_CACHE_TAG = "mu-news";

// 비용 대비 적절한 요약/분류용 기본 모델.
// 필요시 'claude-sonnet-5'로 한 줄만 바꾸면 더 높은 품질의 요약을 받을 수 있음.
export const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

export const DEFAULT_DISCLAIMER =
  "이 내용은 투자 자문이 아니며, Micron Technology(MU) 관련 뉴스를 자동 수집·요약한 참고용 정보입니다. 투자 판단과 그 결과에 대한 책임은 이용자 본인에게 있습니다.";
