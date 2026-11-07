import { X } from "lucide-react";
import type { FilterOptions } from "@/types";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/SelectField";

export interface DoctorFilterValues {
  search: string;
  specialization: string;
  hospital: string;
  from: string;
  to: string;
}

interface DoctorFiltersProps {
  filters: DoctorFilterValues;
  options: FilterOptions | undefined;
  activeCount: number;
  onChange: (changes: Partial<DoctorFilterValues>) => void;
  onClear: () => void;
}

export function DoctorFilters({ filters, options, activeCount, onChange, onClear }: DoctorFiltersProps) {
  const specializations = (options?.specializations ?? []).map((name) => ({ value: name, label: name }));
  const hospitals = (options?.hospitals ?? []).map((name) => ({ value: name, label: name }));

  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 sm:px-5 xl:flex-row xl:items-center">
      <SearchInput
        className="xl:max-w-xs xl:flex-1"
        value={filters.search}
        onChange={(search) => onChange({ search })}
        placeholder="Search name, email or hospital"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-1 xl:items-center">
        <Select
          aria-label="Specialization"
          placeholder="All specializations"
          options={specializations}
          value={filters.specialization}
          onChange={(event) => onChange({ specialization: event.target.value })}
          className="xl:w-48"
        />
        <Select
          aria-label="Hospital"
          placeholder="All hospitals"
          options={hospitals}
          value={filters.hospital}
          onChange={(event) => onChange({ hospital: event.target.value })}
          className="xl:w-48"
        />
        <div className="sm:col-span-2 xl:w-80">
          <DateRangeFilter
            label="Date added"
            from={filters.from}
            to={filters.to}
            onChange={(from, to) => onChange({ from, to })}
          />
        </div>
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 self-start rounded-lg px-2.5 py-2 text-sm font-medium text-primary hover:bg-primary-soft xl:self-center"
        >
          <X className="size-4" />
          Clear {activeCount} {activeCount === 1 ? "filter" : "filters"}
        </button>
      )}
    </div>
  );
}
