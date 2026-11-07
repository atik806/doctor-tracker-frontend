import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { Card } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Small text under the number, e.g. "+12 in the last 30 days". */
  note: string;
  /** Optional % change against the previous period. */
  change?: number | null;
  tone?: "primary" | "danger";
}

function ChangeBadge({ change }: { change: number }) {
  const isUp = change >= 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  const colors = isUp ? "bg-stable-soft text-emerald-700" : "bg-critical-soft text-rose-700";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${colors}`}>
      <Icon className="size-3.5" />
      {isUp ? "+" : ""}
      {change}%
    </span>
  );
}

export function StatCard({ label, value, icon: Icon, note, change, tone = "primary" }: StatCardProps) {
  const iconColors = tone === "danger" ? "bg-danger-soft text-danger" : "bg-primary-soft text-primary";

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className={`flex size-9 items-center justify-center rounded-[10px] ${iconColors}`}>
          <Icon className="size-[18px]" strokeWidth={1.75} />
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">{formatNumber(value)}</p>
        {change !== undefined && change !== null && <ChangeBadge change={change} />}
      </div>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </Card>
  );
}
