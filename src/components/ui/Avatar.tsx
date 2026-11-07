import { initials } from "@/lib/format";

// A few soft background colours; the same name always gets the same colour.
const COLORS = [
  "bg-teal-100 text-teal-800",
  "bg-indigo-100 text-indigo-800",
  "bg-sky-100 text-sky-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-emerald-100 text-emerald-800",
];

function colorFor(name: string) {
  let total = 0;
  for (const char of name) total += char.charCodeAt(0);
  return COLORS[total % COLORS.length];
}

export function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const sizeClass = size === "lg" ? "size-14 text-lg" : "size-9 text-xs";
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizeClass} ${colorFor(name)}`}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
