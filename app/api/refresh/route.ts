import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { DIGEST_CACHE_TAG } from "@/lib/config";
import { getMuNewsDigest } from "@/lib/digest";

export const dynamic = "force-dynamic";

/**
 * Vercel Cron이 하루 1회 호출하는 캐시 예열 라우트.
 * 단순히 캐시를 무효화만 하는 것이 아니라, 즉시 재계산해 다음 방문자가
 * 최신 데이터를 기다리지 않도록 캐시를 미리 채워둔다.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  revalidateTag(DIGEST_CACHE_TAG);
  const digest = await getMuNewsDigest();

  return NextResponse.json({
    ok: true,
    refreshedAt: new Date().toISOString(),
    digestOk: digest.ok,
  });
}
