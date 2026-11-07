export function Skeleton({ className = "rounded-md" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

/** Placeholder rows shaped like a table while the first page loads. */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  const items = Array.from({ length: rows }, (_, index) => index);

  return (
    <div className="divide-y divide-border" aria-busy="true" aria-label="Loading">
      {items.map((item) => (
        <div key={item} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3 rounded-md" />
            <Skeleton className="h-3 w-1/4 rounded-md" />
          </div>
          <Skeleton className="hidden h-3.5 w-24 rounded-md md:block" />
          <Skeleton className="hidden h-3.5 w-20 rounded-md md:block" />
        </div>
      ))}
    </div>
  );
}
