import { inputClasses } from "./TextField";

interface DateRangeFilterProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  label: string;
}

/** Two date inputs ("from" and "to"). Each stops the other from picking an impossible range. */
export function DateRangeFilter({ from, to, onChange, label }: DateRangeFilterProps) {
  const dateInput = `${inputClasses} border-border min-w-0 flex-1 text-muted [&:valid]:text-foreground`;

  return (
    <fieldset className="flex min-w-0 items-center gap-2">
      <legend className="sr-only">{label}</legend>
      <input
        type="date"
        value={from}
        max={to || undefined}
        onChange={(event) => onChange(event.target.value, to)}
        aria-label={`${label} from`}
        className={dateInput}
      />
      <span className="text-sm text-subtle" aria-hidden>
        to
      </span>
      <input
        type="date"
        value={to}
        min={from || undefined}
        onChange={(event) => onChange(from, event.target.value)}
        aria-label={`${label} to`}
        className={dateInput}
      />
    </fieldset>
  );
}
