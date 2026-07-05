export function Disclaimer({ text }: { text: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t border-white/[0.08] bg-graphite-950/95 px-4 py-3 backdrop-blur">
      <p className="mx-auto max-w-4xl text-center text-xs leading-relaxed text-warmgray-500">
        ⚠ {text}
      </p>
    </div>
  );
}
