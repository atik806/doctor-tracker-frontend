"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Condition, Stats } from "@/types";
import { CONDITION_LABELS, formatNumber } from "@/lib/format";
import { tooltipProps } from "../chartStyles";

const CONDITION_COLORS: Record<Condition, string> = {
  stable: "var(--stable)",
  recovering: "var(--recovering)",
  observation: "var(--observation)",
  critical: "var(--critical)",
  discharged: "var(--discharged)",
};

export default function ConditionChart({ data }: { data: Stats["byCondition"] }) {
  let total = 0;
  for (const item of data) total += item.count;

  const slices = data
    .filter((item) => item.count > 0)
    .map((item) => ({ ...item, label: CONDITION_LABELS[item.condition] }));

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col">
      <div className="relative size-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={slices} dataKey="count" nameKey="label" innerRadius="66%" outerRadius="100%"
              paddingAngle={2} stroke="none">
              {slices.map((slice) => (
                <Cell key={slice.condition} fill={CONDITION_COLORS[slice.condition]} />
              ))}
            </Pie>
            <Tooltip {...tooltipProps} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums">{formatNumber(total)}</span>
          <span className="text-xs text-muted">patients</span>
        </div>
      </div>

      <ul className="w-full space-y-2.5">
        {data.map((item) => {
          const percent = total === 0 ? 0 : Math.round((item.count / total) * 100);
          return (
            <li key={item.condition} className="flex items-center gap-2.5 text-sm">
              <span className="size-2.5 rounded-full" style={{ background: CONDITION_COLORS[item.condition] }} />
              <span className="flex-1 text-muted">{CONDITION_LABELS[item.condition]}</span>
              <span className="font-semibold tabular-nums">{item.count}</span>
              <span className="w-10 text-right text-xs text-subtle tabular-nums">{percent}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
