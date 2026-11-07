import { useId } from "react";
import type { LucideIcon } from "lucide-react";

export const inputClasses =
  "h-10 w-full rounded-[10px] border bg-surface px-3 text-sm text-foreground placeholder:text-subtle " +
  "transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/15 " +
  "disabled:bg-surface-muted";

interface FieldShellProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

/** Label + control + error/hint text. Used by TextField and SelectField. */
export function FieldShell({ id, label, error, hint, required, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden>*</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-message`} className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-message`} className="text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  /** Optional icon shown inside the input on the left. */
  icon?: LucideIcon;
  /** Optional element shown inside the input on the right (e.g. a "show password" button). */
  trailing?: React.ReactNode;
}

export function TextField({
  label,
  error,
  hint,
  required,
  icon: Icon,
  trailing,
  className = "",
  ...props
}: TextFieldProps) {
  const id = useId();
  const borderColor = error ? "border-danger" : "border-border";
  const leftPadding = Icon ? "pl-10" : "";
  const rightPadding = trailing ? "pr-11" : "";

  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-subtle"
            aria-hidden
          />
        )}
        <input
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-message` : undefined}
          className={`${inputClasses} ${borderColor} ${leftPadding} ${rightPadding} ${className}`}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div>}
      </div>
    </FieldShell>
  );
}
