import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface SortableHeaderProps {
  label: string;
  field: string;
  /** Current sort, e.g. "name" (ascending) or "-createdAt" (descending). */
  sort: string;
  onSort: (sort: string) => void;
  className?: string;
}

/** A table header button: first click sorts ascending, the next click descending. */
export function SortableHeader({ label, field, sort, onSort, className = "" }: SortableHeaderProps) {
  const isAscending = sort === field;
  const isDescending = sort === `-${field}`;

  function handleClick() {
    onSort(isAscending ? `-${field}` : field);
  }

  let Icon = ArrowUpDown;
  let ariaSort: "ascending" | "descending" | "none" = "none";
  if (isAscending) {
    Icon = ArrowUp;
    ariaSort = "ascending";
  }
  if (isDescending) {
    Icon = ArrowDown;
    ariaSort = "descending";
  }

  return (
    <th scope="col" aria-sort={ariaSort} className={className}>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1 rounded tracking-[inherit] uppercase hover:text-foreground"
      >
        {label}
        <Icon className={`size-3.5 ${ariaSort === "none" ? "text-subtle" : "text-primary"}`} aria-hidden />
      </button>
    </th>
  );
}
