import type { KeyIssue } from "@/lib/types";
import { IssueCard } from "./IssueCard";

export function IssueList({ issues }: { issues: KeyIssue[] }) {
  return (
    <section>
      <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-warmgray-500">
        주요 이슈
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {issues.map((issue, i) => (
          <IssueCard key={issue.link + i} issue={issue} index={i} />
        ))}
      </div>
    </section>
  );
}
