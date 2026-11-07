import { Activity, TrendingUp, UsersRound } from "lucide-react";

/*
 * A small, static preview of the dashboard for the login page's brand panel.
 * It's plain markup (no chart library), so it adds no JavaScript to the login page.
 */

// Bar heights (in %) for the mini "admissions" chart.
const BARS = [32, 48, 40, 62, 54, 70, 58, 76, 66, 84, 72, 92];

const CONDITIONS = [
  { label: "Stable", percent: 41, color: "bg-emerald-400" },
  { label: "Recovering", percent: 30, color: "bg-sky-400" },
  { label: "Observation", percent: 13, color: "bg-amber-400" },
];

function AdmissionsCard() {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl shadow-teal-950/30 backdrop-blur-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-teal-50/70">New patients · last 30 days</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">46</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-semibold text-emerald-200">
          <TrendingUp className="size-3.5" />
          +59%
        </span>
      </div>

      <div className="mt-5 flex h-20 items-end gap-1.5" aria-hidden>
        {BARS.map((height, index) => (
          <span
            key={index}
            className={`flex-1 rounded-t-[3px] ${index === BARS.length - 1 ? "bg-white" : "bg-white/35"}`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      <div className="mt-5 space-y-2.5">
        {CONDITIONS.map((item) => (
          <div key={item.label} className="flex items-center gap-3 text-xs">
            <span className="w-20 text-teal-50/75">{item.label}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <span className={`block h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
            </span>
            <span className="w-8 text-right font-semibold tabular-nums">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FloatingStat({ icon: Icon, label, value, className }: {
  icon: typeof Activity;
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div
      className={`absolute flex items-center gap-3 rounded-xl border border-white/60 bg-white px-3.5 py-2.5 text-slate-900 shadow-xl shadow-teal-950/25 ${className}`}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <span>
        <span className="block text-[11px] text-slate-500">{label}</span>
        <span className="block text-sm font-semibold tabular-nums">{value}</span>
      </span>
    </div>
  );
}

export function LoginShowcase() {
  return (
    <div className="relative mx-auto w-full max-w-sm" aria-hidden>
      <AdmissionsCard />
      {/* Placed just outside the card's corners so they never cover its content */}
      <FloatingStat icon={UsersRound} label="Total patients" value="320" className="-top-14 -right-10" />
      <FloatingStat icon={Activity} label="Active doctors" value="26" className="-bottom-14 -left-10" />
    </div>
  );
}
