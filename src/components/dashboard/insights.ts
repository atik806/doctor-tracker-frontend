import type { Stats, StatsRange } from "@/types";
import { CONDITION_LABELS, percentChange } from "@/lib/format";
import { rangeDescription } from "./RangePicker";

/* One plain-language sentence per chart, so the numbers are easy to read at a glance. */

export function trendInsight(stats: Stats, range: StatsRange) {
  const change = percentChange(stats.newPatients, stats.previousNewPatients);
  if (range === "all") return `${stats.newPatients} patients admitted since the first record.`;
  if (change === null) return `${stats.newPatients} patients admitted in ${rangeDescription(range)}.`;
  if (change === 0) return `Admissions are level with the previous period.`;
  const direction = change > 0 ? "up" : "down";
  return `Admissions are ${direction} ${Math.abs(change)}% compared with the previous period.`;
}

export function doctorInsight(stats: Stats) {
  const top = stats.patientsPerDoctor[0];
  if (!top) return "No patients were admitted in this period.";
  return `${top.name} has the most patients (${top.patients}).`;
}

export function conditionInsight(stats: Stats) {
  let total = 0;
  let largest = stats.byCondition[0];
  for (const item of stats.byCondition) {
    total += item.count;
    if (item.count > largest.count) largest = item;
  }
  if (total === 0) return "No patients in this period.";
  const percent = Math.round((largest.count / total) * 100);
  return `Most patients are ${CONDITION_LABELS[largest.condition].toLowerCase()} (${percent}%).`;
}

export function specializationInsight(stats: Stats) {
  const top = stats.bySpecialization[0];
  if (!top || top.patients === 0) return "Doctors per specialization.";
  return `${top.specialization} sees the most patients in this period.`;
}
