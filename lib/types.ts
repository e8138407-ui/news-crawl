export interface NewsItem {
  title: string;
  summary: string;
  source: string;
  link: string;
  publishedAt: string; // ISO 8601
}

export interface KeyIssue {
  title: string;
  description: string;
  link: string;
}

export type ToneLabel = "positive" | "neutral" | "negative";

export interface ToneAnalysis {
  label: ToneLabel;
  score: number; // 0-100
  reasoning: string;
}

export interface DigestResult {
  ok: true;
  summary: string;
  keyIssues: KeyIssue[];
  tone: ToneAnalysis;
  factors: string[];
  disclaimer: string;
  newsItems: NewsItem[];
  generatedAt: string; // ISO 8601
}

export interface DigestFailure {
  ok: false;
  error: string;
  newsItems: NewsItem[];
  generatedAt: string; // ISO 8601
}

export type Digest = DigestResult | DigestFailure;
