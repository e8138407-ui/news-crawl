import { XMLParser } from "fast-xml-parser";
import {
  FALLBACK_WINDOW_HOURS,
  FEED_FETCH_TIMEOUT_MS,
  FRESH_WINDOW_HOURS,
  MAX_ITEMS,
  MIN_ITEMS_BEFORE_WIDENING,
  REVALIDATE_SECONDS,
  RSS_SOURCES,
  type RssSource,
} from "./config";
import type { NewsItem } from "./types";

const parser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
});

function stripHtml(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function parsePubDate(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

async function fetchFeed(source: RssSource): Promise<NewsItem[]> {
  try {
    const res = await fetch(source.url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(FEED_FETCH_TIMEOUT_MS),
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": "Mozilla/5.0 (compatible; MuNewsDashboard/1.0)",
      },
    });

    if (!res.ok) {
      console.error(`[rss] ${source.name} responded with ${res.status}`);
      return [];
    }

    const xmlText = await res.text();
    const parsed = parser.parse(xmlText);
    const items = asArray(parsed?.rss?.channel?.item);

    return items
      .map((item): NewsItem | null => {
        const title = stripHtml(item?.title);
        const link = typeof item?.link === "string" ? item.link.trim() : "";
        const publishedAt = parsePubDate(item?.pubDate);

        if (!title || !link || !publishedAt) return null;

        return {
          title,
          summary: stripHtml(item?.description),
          source: source.name,
          link,
          publishedAt,
        };
      })
      .filter((item): item is NewsItem => item !== null);
  } catch (err) {
    console.error(`[rss] Failed to fetch/parse ${source.name}:`, (err as Error).message);
    return [];
  }
}

function normalizeKey(item: NewsItem): string {
  return item.title.toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
}

function dedupe(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const result: NewsItem[] = [];

  for (const item of items) {
    const key = normalizeKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

function withinHours(item: NewsItem, hours: number, now: number): boolean {
  const publishedTime = new Date(item.publishedAt).getTime();
  const ageMs = now - publishedTime;
  return ageMs >= 0 && ageMs <= hours * 60 * 60 * 1000;
}

export async function fetchAllFeeds(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(RSS_SOURCES.map(fetchFeed));

  const allItems = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );

  const sorted = dedupe(allItems).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const now = Date.now();
  const fresh = sorted.filter((item) => withinHours(item, FRESH_WINDOW_HOURS, now));

  const candidates =
    fresh.length >= MIN_ITEMS_BEFORE_WIDENING
      ? fresh
      : sorted.filter((item) => withinHours(item, FALLBACK_WINDOW_HOURS, now));

  return candidates.slice(0, MAX_ITEMS);
}
