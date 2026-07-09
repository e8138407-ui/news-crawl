export interface RssSource {
  name: string;
  url: string;
}

export interface Company {
  ticker: string; // "MU"
  slug: string; // "mu" (URL: /mu)
  nameEn: string; // "Micron Technology"
  nameKo: string; // "마이크론 테크놀로지"
  googleNewsQuery: string; // "Micron+Technology+OR+MU+stock"
}

export const COMPANIES: Company[] = [
  {
    ticker: "MU",
    slug: "mu",
    nameEn: "Micron Technology",
    nameKo: "마이크론 테크놀로지",
    googleNewsQuery: "Micron+Technology+OR+MU+stock",
  },
  {
    ticker: "INTC",
    slug: "intc",
    nameEn: "Intel Corporation",
    nameKo: "인텔",
    googleNewsQuery: "Intel+Corporation+OR+INTC+stock",
  },
  {
    ticker: "SNDK",
    slug: "sndk",
    nameEn: "SanDisk",
    nameKo: "샌디스크",
    googleNewsQuery: "SanDisk+OR+SNDK+stock",
  },
  {
    ticker: "ASTS",
    slug: "asts",
    nameEn: "AST SpaceMobile",
    nameKo: "AST 스페이스모바일",
    googleNewsQuery: "AST+SpaceMobile+OR+ASTS+stock",
  },
  {
    ticker: "MRVL",
    slug: "mrvl",
    nameEn: "Marvell Technology",
    nameKo: "마벨 테크놀로지",
    googleNewsQuery: "Marvell+Technology+OR+MRVL+stock",
  },
  {
    ticker: "COHR",
    slug: "cohr",
    nameEn: "Coherent Corp",
    nameKo: "코히런트",
    googleNewsQuery: "Coherent+Corp+OR+COHR+stock",
  },
  {
    ticker: "AVGO",
    slug: "avgo",
    nameEn: "Broadcom Inc.",
    nameKo: "브로드컴",
    googleNewsQuery: "Broadcom+OR+AVGO+stock",
  },
  {
    ticker: "TSM",
    slug: "tsm",
    nameEn: "Taiwan Semiconductor Manufacturing (TSMC)",
    nameKo: "TSMC",
    googleNewsQuery: "TSMC+OR+Taiwan+Semiconductor+OR+TSM+stock",
  },
];

export const DEFAULT_TICKER = "MU";

export function getCompanyBySlug(slug: string): Company | undefined {
  const normalized = slug.toLowerCase();
  return COMPANIES.find((c) => c.slug === normalized);
}

export function getRssSources(company: Company): RssSource[] {
  return [
    {
      name: "Google News",
      url: `https://news.google.com/rss/search?q=${company.googleNewsQuery}&hl=en-US&gl=US&ceid=US:en`,
    },
    {
      name: "Yahoo Finance",
      url: `https://finance.yahoo.com/rss/headline?s=${company.ticker}`,
    },
  ];
}

export function getDigestCacheTag(ticker: string): string {
  return `news-${ticker.toLowerCase()}`;
}

export function getDefaultDisclaimer(company: Company): string {
  return `이 내용은 투자 자문이 아니며, ${company.nameEn}(${company.ticker}) 관련 뉴스를 자동 수집·요약한 참고용 정보입니다. 투자 판단과 그 결과에 대한 책임은 이용자 본인에게 있습니다.`;
}

export const FRESH_WINDOW_HOURS = 24;
export const FALLBACK_WINDOW_HOURS = 48;
export const MIN_ITEMS_BEFORE_WIDENING = 6;
export const MAX_ITEMS = 18;

export const FEED_FETCH_TIMEOUT_MS = 8000;
export const CLAUDE_TIMEOUT_MS = 30000;

// 캐시/재검증 주기 (초). ISR revalidate와 unstable_cache에서 공유.
export const REVALIDATE_SECONDS = 43200; // 12시간

// 비용 대비 적절한 요약/분류용 기본 모델.
// 필요시 'claude-sonnet-5'로 한 줄만 바꾸면 더 높은 품질의 요약을 받을 수 있음.
export const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
