import type { Condition } from "@/types";
import { CONDITION_LABELS } from "@/lib/format";

const CONDITION_CLASSES: Record<Condition, string> = {
  stable: "bg-stable-soft text-emerald-700",
  recovering: "bg-recovering-soft text-sky-700",
  observation: "bg-observation-soft text-amber-700",
  critical: "bg-critical-soft text-rose-700",
  discharged: "bg-discharged-soft text-slate-600",
};

const DOT_CLASSES: Record<Condition, string> = {
  stable: "bg-stable",
  recovering: "bg-recovering",
  observation: "bg-observation",
  critical: "bg-critical",
  discharged: "bg-discharged",
};

export function ConditionBadge({ condition }: { condition: Condition }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${CONDITION_CLASSES[condition]}`}
    >
      <span className={`size-1.5 rounded-full ${DOT_CLASSES[condition]}`} aria-hidden />
      {CONDITION_LABELS[condition]}
    </span>
  );
}
