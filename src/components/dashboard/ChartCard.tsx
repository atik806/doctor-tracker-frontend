import { Card } from "@/components/ui/Card";

interface ChartCardProps {
  title: string;
  /** One sentence that explains what the chart shows. Also helps screen-reader users. */
  insight: string;
  className?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, insight, className = "", children }: ChartCardProps) {
  return (
    <Card className={`flex flex-col p-5 ${className}`}>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-0.5 text-sm text-muted">{insight}</p>
      <div className="mt-5 flex-1">{children}</div>
    </Card>
  );
}
