/** Bloques de carga con el mismo ritmo visual que el contenido real. */

export function SkeletonMarketCard() {
  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="skeleton mb-4 h-3 w-1/2" />
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="skeleton h-[58px] rounded-xl" />
        <div className="skeleton h-[58px] rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonBoard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="skeleton h-5 w-32" />
          <div className="skeleton h-3 w-52" />
        </div>
        <div className="skeleton h-10 w-36 rounded-xl" />
      </div>
      <div className="space-y-2.5">
        <div className="skeleton mb-3 h-3 w-24" />
        <SkeletonMarketCard />
        <SkeletonMarketCard />
        <SkeletonMarketCard />
      </div>
    </div>
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card hairline overflow-hidden">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <div className="skeleton h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-1/3" />
            <div className="skeleton h-2.5 w-1/2" />
          </div>
          <div className="skeleton h-5 w-14" />
        </div>
      ))}
    </div>
  );
}
