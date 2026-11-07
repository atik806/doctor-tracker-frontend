import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { FieldShell, inputClasses } from "./TextField";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: SelectOption[];
  placeholder?: string;
}

/** A styled <select> without a label, used in filter toolbars. */
export function Select({ options, placeholder, className = "", ...props }: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select className={`${inputClasses} appearance-none border-border pr-9`} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-subtle"
        aria-hidden
      />
    </div>
  );
}

interface SelectFieldProps extends SelectProps {
  label: string;
  error?: string;
}

/** A <select> with a label and an error message, used in forms. */
export function SelectField({ label, error, required, options, placeholder, ...props }: SelectFieldProps) {
  const id = useId();

  return (
    <FieldShell id={id} label={label} error={error} required={required}>
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-message` : undefined}
          className={`${inputClasses} appearance-none pr-9 ${error ? "border-danger" : "border-border"}`}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-subtle"
          aria-hidden
        />
      </div>
    </FieldShell>
  );
}
