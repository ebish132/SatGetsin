export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <div className="flex gap-3 overflow-hidden pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-28 shrink-0 animate-pulse rounded-full bg-gray-200"
          />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <div className="aspect-4/3 w-full animate-pulse bg-gray-200" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
