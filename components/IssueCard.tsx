import type { KeyIssue } from "@/lib/types";

export function IssueCard({ issue, index }: { issue: KeyIssue; index: number }) {
  return (
    <a
      href={issue.link}
      target="_blank"
      rel="noreferrer noopener"
      className="group relative flex flex-col gap-2 rounded-lg border border-white/[0.08] bg-graphite-800 p-5 shadow-panel transition-colors hover:border-copper-500/40"
      style={{ clipPath: "polygon(0 12px, 12px 0, 100% 0, 100% 100%, 0 100%)" }}
    >
      <span className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-copper-500/70" />
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-xs text-warmgray-500">ISSUE {String(index + 1).padStart(2, "0")}</span>
        <span className="font-mono text-xs text-copper-400 opacity-0 transition-opacity group-hover:opacity-100">
          원문 보기 →
        </span>
      </div>
      <h3 className="text-base font-semibold leading-snug text-warmgray-300 group-hover:text-white">
        {issue.title}
      </h3>
      <p className="text-sm leading-relaxed text-warmgray-400">{issue.description}</p>
    </a>
  );
}
