import type { Condition } from "@/types";

export function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

/** Percentage change from `previous` to `current`, or null when there is nothing to compare. */
export function percentChange(current: number, previous: number) {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function initials(name: string) {
  const words = name.replace(/^Dr\.\s*/, "").split(" ").filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export const CONDITION_LABELS: Record<Condition, string> = {
  stable: "Stable",
  recovering: "Recovering",
  observation: "Under observation",
  critical: "Critical",
  discharged: "Discharged",
};

/** Today's date in the user's own time zone, as "YYYY-MM-DD" (what a date input expects). */
export function todayDateString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** "2026-11-07T10:00:00Z" → "2026-11-07", the value a date input expects. */
export function toDateInputValue(isoDate: string) {
  return isoDate.slice(0, 10);
}
