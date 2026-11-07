export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={`rounded-xl border border-border bg-surface shadow-card ${className}`}>{children}</section>
  );
}
