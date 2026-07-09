import type { KeyIssue } from "@/lib/types";
import { IssueCard } from "./IssueCard";

export function IssueList({ issues }: { issues: KeyIssue[] }) {
  return (
    <section>
      <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-warmgray-500">
        주요 이슈
      </h2>
      {issues.length === 0 ? (
        <p className="rounded-lg border border-white/[0.08] bg-graphite-800 p-5 text-sm text-warmgray-400">
          오늘은 특별히 부각된 주요 이슈가 없습니다. 기관 지분 변동 공시 등 형식적인 뉴스 위주였습니다.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue, i) => (
            <IssueCard key={issue.link + i} issue={issue} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
