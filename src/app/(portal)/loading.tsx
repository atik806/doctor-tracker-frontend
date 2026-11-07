import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";

export default function PortalLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-48 rounded-md" />
      <Skeleton className="mt-2 h-4 w-72 rounded-md" />
      <div className="mt-8 rounded-xl border border-border bg-surface">
        <TableSkeleton />
      </div>
    </div>
  );
}
