import { X } from "lucide-react";
import { CONDITIONS, GENDERS, type FilterOptions } from "@/types";
import { CONDITION_LABELS } from "@/lib/format";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/SelectField";

export interface PatientFilterValues {
  search: string;
  condition: string;
  doctorId: string;
  gender: string;
  from: string;
  to: string;
}

const CONDITION_OPTIONS = CONDITIONS.map((condition) => ({ value: condition, label: CONDITION_LABELS[condition] }));
const GENDER_OPTIONS = GENDERS.map((gender) => ({ value: gender, label: gender[0].toUpperCase() + gender.slice(1) }));

interface PatientFiltersProps {
  filters: PatientFilterValues;
  options: FilterOptions | undefined;
  activeCount: number;
  onChange: (changes: Partial<PatientFilterValues>) => void;
  onClear: () => void;
}

export function PatientFilters({ filters, options, activeCount, onChange, onClear }: PatientFiltersProps) {
  const doctors = (options?.doctors ?? []).map((doctor) => ({ value: doctor.id, label: doctor.name }));

  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 sm:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          className="lg:max-w-sm lg:flex-1"
          value={filters.search}
          onChange={(search) => onChange({ search })}
          placeholder="Search name, phone or diagnosis"
        />
        <div className="lg:ml-auto lg:w-80">
          <DateRangeFilter
            label="Admission date"
            from={filters.from}
            to={filters.to}
            onChange={(from, to) => onChange({ from, to })}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:flex lg:items-center">
        <Select
          aria-label="Condition"
          placeholder="All conditions"
          options={CONDITION_OPTIONS}
          value={filters.condition}
          onChange={(event) => onChange({ condition: event.target.value })}
          className="lg:w-48"
        />
        <Select
          aria-label="Doctor"
          placeholder="All doctors"
          options={doctors}
          value={filters.doctorId}
          onChange={(event) => onChange({ doctorId: event.target.value })}
          className="lg:w-56"
        />
        <Select
          aria-label="Gender"
          placeholder="All genders"
          options={GENDER_OPTIONS}
          value={filters.gender}
          onChange={(event) => onChange({ gender: event.target.value })}
          className="lg:w-40"
        />
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 self-start rounded-lg px-2.5 py-2 text-sm font-medium text-primary hover:bg-primary-soft lg:self-center"
          >
            <X className="size-4" />
            Clear {activeCount} {activeCount === 1 ? "filter" : "filters"}
          </button>
        )}
      </div>
    </div>
  );
}
