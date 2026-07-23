export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
      <div className="shimmer h-4 w-24 rounded bg-surface-2/60" />
      <div className="shimmer mt-6 h-12 w-2/3 max-w-xl rounded-lg bg-surface-2/60" />
      <div className="shimmer mt-4 h-4 w-full max-w-lg rounded bg-surface-2/40" />

      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="shimmer aspect-square rounded-2xl border border-[var(--line)] bg-surface-2/40"
          />
        ))}
      </div>
    </div>
  );
}
