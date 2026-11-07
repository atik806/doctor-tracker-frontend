import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "danger" | "danger-outline" | "ghost";
type Size = "md" | "sm" | "icon";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
  secondary: "bg-surface text-foreground border border-border hover:bg-surface-muted hover:border-border-strong",
  danger: "bg-danger text-white hover:bg-danger-hover shadow-sm",
  "danger-outline": "bg-surface text-danger border border-border hover:bg-danger-soft hover:border-danger/30",
  ghost: "text-muted hover:bg-surface-muted hover:text-foreground",
};

const SIZE_CLASSES: Record<Size, string> = {
  md: "h-10 px-4 text-sm gap-2",
  sm: "h-9 px-3 text-sm gap-1.5",
  icon: "size-9",
};

/** Shared so links can look exactly like buttons. */
export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return [
    "inline-flex shrink-0 items-center justify-center rounded-[10px] font-semibold whitespace-nowrap",
    "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
  ].join(" ");
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${buttonClasses(variant, size)} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
