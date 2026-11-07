interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tone?: "default" | "danger";
}

/** Small square button for row actions. `label` is used for both the tooltip and screen readers. */
export function IconButton({ label, tone = "default", children, className = "", ...props }: IconButtonProps) {
  const toneClass =
    tone === "danger"
      ? "text-subtle hover:bg-danger-soft hover:text-danger"
      : "text-subtle hover:bg-surface-muted hover:text-foreground";

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`flex size-8 items-center justify-center rounded-lg transition-colors ${toneClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
