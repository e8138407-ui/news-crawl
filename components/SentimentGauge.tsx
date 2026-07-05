import type { ToneAnalysis } from "@/lib/types";

const TONE_COPY: Record<ToneAnalysis["label"], { label: string; badge: string; text: string }> = {
  positive: {
    label: "긍정적",
    badge: "bg-teal-500/15 text-teal-400 ring-1 ring-teal-500/40",
    text: "text-teal-400",
  },
  neutral: {
    label: "중립적",
    badge: "bg-warmgray-500/15 text-warmgray-300 ring-1 ring-warmgray-500/40",
    text: "text-warmgray-300",
  },
  negative: {
    label: "부정적",
    badge: "bg-brick-500/15 text-brick-400 ring-1 ring-brick-500/40",
    text: "text-brick-400",
  },
};

// score 0-100 -> needle angle -90deg(부정) ~ 90deg(긍정)
function scoreToAngle(score: number): number {
  const clamped = Math.max(0, Math.min(100, score));
  return (clamped / 100) * 180 - 90;
}

export function SentimentGauge({ tone }: { tone: ToneAnalysis }) {
  const angle = scoreToAngle(tone.score);
  const copy = TONE_COPY[tone.label];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-[100px] w-[220px]">
        <svg viewBox="0 0 220 110" className="h-full w-full" aria-hidden="true">
          <path
            d="M 14 100 A 96 96 0 0 1 80 10"
            fill="none"
            stroke="currentColor"
            className="text-brick-500"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 80 10 A 96 96 0 0 1 140 10"
            fill="none"
            stroke="currentColor"
            className="text-warmgray-500"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 140 10 A 96 96 0 0 1 206 100"
            fill="none"
            stroke="currentColor"
            className="text-teal-500"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: "110px 100px" }}>
            <line
              x1="110"
              y1="100"
              x2="110"
              y2="24"
              stroke="currentColor"
              className="text-copper-400"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
          <circle cx="110" cy="100" r="6" fill="currentColor" className="text-copper-400" />
        </svg>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-3xl font-semibold text-copper-400">{tone.score}</span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-warmgray-500">
          / 100
        </span>
      </div>
      <span className={`mt-2 rounded-full px-4 py-1 text-sm font-medium ${copy.badge}`}>
        오늘의 종합 톤: {copy.label}
      </span>
      <p className="mt-1 max-w-md text-center text-sm text-warmgray-400">{tone.reasoning}</p>
    </div>
  );
}
