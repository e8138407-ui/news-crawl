export function FactorsPanel({ factors }: { factors: string[] }) {
  return (
    <section className="rounded-lg border border-white/[0.08] bg-graphite-800 p-5 shadow-panel">
      <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-warmgray-500">
        주가에 영향을 줄 수 있는 요인
      </h2>
      <div className="flex flex-wrap gap-2">
        {factors.map((factor, i) => (
          <span
            key={i}
            className="rounded border border-copper-500/30 bg-copper-500/10 px-3 py-1 font-mono text-xs text-copper-400"
          >
            {factor}
          </span>
        ))}
      </div>
    </section>
  );
}
