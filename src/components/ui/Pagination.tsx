import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PageMeta } from "@/types";
import { formatNumber } from "@/lib/format";
import { Select } from "./SelectField";

const PAGE_SIZES = [
  { value: "10", label: "10 / page" },
  { value: "20", label: "20 / page" },
  { value: "50", label: "50 / page" },
];

/** Page numbers to show, e.g. [1, "…", 4, 5, 6, "…", 12]. */
function getPageNumbers(current: number, total: number) {
  if (total <= 7) {
    const all: (number | "…")[] = [];
    for (let page = 1; page <= total; page++) all.push(page);
    return all;
  }

  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let page = start; page <= end; page++) pages.push(page);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

interface PaginationProps {
  meta: PageMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function Pagination({ meta, onPageChange, onLimitChange }: PaginationProps) {
  const first = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const last = Math.min(meta.page * meta.limit, meta.total);
  const pageButton =
    "flex size-9 items-center justify-center rounded-lg text-sm font-medium tabular-nums transition-colors";

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted">
          Showing <span className="font-semibold text-foreground tabular-nums">{first}–{last}</span> of{" "}
          <span className="font-semibold text-foreground tabular-nums">{formatNumber(meta.total)}</span>
        </p>
        <Select
          aria-label="Rows per page"
          className="hidden w-32 sm:block"
          value={String(meta.limit)}
          options={PAGE_SIZES}
          onChange={(event) => onLimitChange(Number(event.target.value))}
        />
      </div>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button
          type="button"
          className={`${pageButton} text-muted hover:bg-surface-muted disabled:opacity-40`}
          onClick={() => onPageChange(meta.page - 1)}
          disabled={meta.page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>

        {getPageNumbers(meta.page, meta.totalPages).map((page, index) => {
          if (page === "…") {
            return (
              <span key={`gap-${index}`} className="w-6 text-center text-sm text-subtle">
                …
              </span>
            );
          }
          const isCurrent = page === meta.page;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={isCurrent ? "page" : undefined}
              className={`${pageButton} ${isCurrent ? "bg-primary text-white" : "text-foreground hover:bg-surface-muted"}`}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          className={`${pageButton} text-muted hover:bg-surface-muted disabled:opacity-40`}
          onClick={() => onPageChange(meta.page + 1)}
          disabled={meta.page >= meta.totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </div>
  );
}
