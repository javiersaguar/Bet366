export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="card space-y-5 p-5">
        <div className="flex items-center gap-4">
          <div className="skeleton h-24 w-24 rounded-3xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-5 w-1/2" />
            <div className="skeleton h-3 w-1/3" />
          </div>
        </div>
        <div className="skeleton h-8 w-full" />
        <div className="skeleton h-28 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton h-[74px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
