import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { COMPANIES, getDigestCacheTag } from "@/lib/config";
import { getNewsDigest } from "@/lib/digest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Vercel Cron이 하루 1회 호출하는 캐시 예열 라우트.
 * 모든 종목을 병렬로 무효화 후 즉시 재계산해, 다음 방문자가
 * 최신 데이터를 기다리지 않도록 캐시를 미리 채워둔다.
 * 한 종목이 실패해도 나머지 종목 갱신에는 영향이 없다(Promise.allSettled).
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const results = await Promise.allSettled(
    COMPANIES.map(async (company) => {
      revalidateTag(getDigestCacheTag(company.ticker));
      const digest = await getNewsDigest(company.ticker);
      return { ticker: company.ticker, digestOk: digest.ok };
    })
  );

  const companies = results.map((result, i) =>
    result.status === "fulfilled"
      ? result.value
      : { ticker: COMPANIES[i].ticker, digestOk: false, error: (result.reason as Error).message }
  );

  return NextResponse.json({
    ok: true,
    refreshedAt: new Date().toISOString(),
    companies,
  });
}
