import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, CLAUDE_TIMEOUT_MS, DEFAULT_DISCLAIMER } from "./config";
import type { Digest, DigestFailure, DigestResult, NewsItem } from "./types";

const TOOL_NAME = "emit_mu_news_digest";

const DIGEST_TOOL: Anthropic.Tool = {
  name: TOOL_NAME,
  description:
    "Micron Technology(MU) 뉴스 목록을 분석한 결과를 구조화된 형식으로 제출합니다.",
  input_schema: {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "전체 뉴스 흐름에 대한 한국어 요약, 3~5문장.",
      },
      keyIssues: {
        type: "array",
        description: "주요 이슈 3~5개.",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "이슈 제목 (한국어)" },
            description: { type: "string", description: "이슈에 대한 1~2문장 설명 (한국어)" },
            link: { type: "string", description: "관련 뉴스의 원문 링크 (입력받은 뉴스 목록의 link 중 하나를 그대로 사용)" },
          },
          required: ["title", "description", "link"],
        },
      },
      tone: {
        type: "object",
        description: "뉴스 전반에 나타난 투자 심리 톤 분석.",
        properties: {
          label: { type: "string", enum: ["positive", "neutral", "negative"] },
          score: { type: "number", description: "0(매우 부정)~100(매우 긍정) 사이 점수" },
          reasoning: { type: "string", description: "해당 라벨과 점수를 매긴 근거 (한국어, 1~3문장)" },
        },
        required: ["label", "score", "reasoning"],
      },
      factors: {
        type: "array",
        description: "주가에 영향을 줄 수 있는 요인 목록 (예: 실적 발표, 반도체 수요, 경쟁사 동향, 거시경제 이슈 등), 한국어.",
        items: { type: "string" },
      },
      disclaimer: {
        type: "string",
        description: "투자 자문이 아니라는 면책 문구 (한국어).",
      },
    },
    required: ["summary", "keyIssues", "tone", "factors", "disclaimer"],
  },
};

function buildPrompt(items: NewsItem[]): string {
  const list = items
    .map(
      (item, i) =>
        `${i + 1}. [${item.source}] ${item.title} (발행: ${item.publishedAt})\n   요약: ${item.summary || "(설명 없음)"}\n   링크: ${item.link}`
    )
    .join("\n");

  return `다음은 최근 24~48시간 이내에 수집된 Micron Technology(MU) 관련 뉴스 목록입니다.\n\n${list}\n\n이 뉴스 목록을 바탕으로 ${TOOL_NAME} 도구를 사용해 분석 결과를 제출하세요. keyIssues의 link는 반드시 위 목록에 있는 link 값을 그대로 사용하세요. disclaimer에는 "이 내용은 투자 자문이 아니며 참고용 뉴스 요약입니다"라는 취지의 문구를 반드시 포함하세요.`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseDigestInput(input: unknown, newsItems: NewsItem[]): DigestResult | null {
  if (!isRecord(input)) return null;

  const summary = typeof input.summary === "string" ? input.summary : null;
  const toneRaw = input.tone;
  const factors = Array.isArray(input.factors)
    ? input.factors.filter((f): f is string => typeof f === "string")
    : null;
  const keyIssuesRaw = Array.isArray(input.keyIssues) ? input.keyIssues : null;

  if (!summary || !factors || !keyIssuesRaw || !isRecord(toneRaw)) return null;

  const label = toneRaw.label;
  if (label !== "positive" && label !== "neutral" && label !== "negative") return null;
  const score = typeof toneRaw.score === "number" ? toneRaw.score : null;
  const reasoning = typeof toneRaw.reasoning === "string" ? toneRaw.reasoning : null;
  if (score === null || reasoning === null) return null;

  const keyIssues = keyIssuesRaw
    .filter(isRecord)
    .map((issue) => ({
      title: typeof issue.title === "string" ? issue.title : "",
      description: typeof issue.description === "string" ? issue.description : "",
      link: typeof issue.link === "string" ? issue.link : "",
    }))
    .filter((issue) => issue.title && issue.description && issue.link);

  if (keyIssues.length === 0) return null;

  const disclaimer =
    typeof input.disclaimer === "string" && input.disclaimer.trim()
      ? input.disclaimer
      : DEFAULT_DISCLAIMER;

  return {
    ok: true,
    summary,
    keyIssues,
    tone: { label, score: Math.max(0, Math.min(100, score)), reasoning },
    factors,
    // 모델이 면책 문구를 생략/변형하더라도 항상 고정 문구가 함께 노출되도록 보장.
    disclaimer: `${disclaimer}\n\n${DEFAULT_DISCLAIMER}`.trim(),
    newsItems,
    generatedAt: new Date().toISOString(),
  };
}

export async function summarizeNews(newsItems: NewsItem[]): Promise<Digest> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      error: "ANTHROPIC_API_KEY 환경변수가 설정되어 있지 않습니다.",
      newsItems,
      generatedAt: new Date().toISOString(),
    } satisfies DigestFailure;
  }

  if (newsItems.length === 0) {
    return {
      ok: false,
      error: "최근 24~48시간 이내에 수집된 MU 관련 뉴스가 없습니다.",
      newsItems,
      generatedAt: new Date().toISOString(),
    } satisfies DigestFailure;
  }

  try {
    const client = new Anthropic({ apiKey, timeout: CLAUDE_TIMEOUT_MS });

    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      tools: [DIGEST_TOOL],
      tool_choice: { type: "tool", name: TOOL_NAME },
      messages: [{ role: "user", content: buildPrompt(newsItems) }],
    });

    const toolUseBlock = message.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    if (!toolUseBlock) {
      throw new Error("Claude 응답에서 tool_use 블록을 찾을 수 없습니다.");
    }

    const parsed = parseDigestInput(toolUseBlock.input, newsItems);
    if (!parsed) {
      throw new Error("Claude 응답 형식이 예상 스키마와 일치하지 않습니다.");
    }

    return parsed;
  } catch (err) {
    console.error("[claude] summarizeNews failed:", (err as Error).message);
    return {
      ok: false,
      error: `Claude API 호출에 실패했습니다: ${(err as Error).message}`,
      newsItems,
      generatedAt: new Date().toISOString(),
    } satisfies DigestFailure;
  }
}
