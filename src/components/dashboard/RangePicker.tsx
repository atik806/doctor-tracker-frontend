import type { StatsRange } from "@/types";

export const RANGE_OPTIONS: { value: StatsRange; label: string; long: string }[] = [
  { value: "7d", label: "7D", long: "the last 7 days" },
  { value: "30d", label: "30D", long: "the last 30 days" },
  { value: "90d", label: "90D", long: "the last 90 days" },
  { value: "12m", label: "12M", long: "the last 12 months" },
  { value: "all", label: "All", long: "all time" },
];

export function rangeDescription(range: StatsRange) {
  const option = RANGE_OPTIONS.find((item) => item.value === range);
  return option ? option.long : "the selected period";
}

interface RangePickerProps {
  value: StatsRange;
  onChange: (range: StatsRange) => void;
}

/** Segmented control for the dashboard date range. */
export function RangePicker({ value, onChange }: RangePickerProps) {
  return (
    <div role="radiogroup" aria-label="Date range" className="inline-flex rounded-[10px] border border-border bg-surface p-1 shadow-card">
      {RANGE_OPTIONS.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.long}
            onClick={() => onChange(option.value)}
            className={`h-8 rounded-lg px-3 text-sm font-semibold transition-colors ${
              isSelected ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
