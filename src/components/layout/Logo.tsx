import { HeartPulse } from "lucide-react";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`flex size-9 items-center justify-center rounded-[10px] ${
          inverted ? "bg-white/15 text-white" : "bg-primary text-white"
        }`}
      >
        <HeartPulse className="size-5" strokeWidth={2} />
      </span>
      <span className={`text-[15px] font-bold tracking-tight ${inverted ? "text-white" : "text-foreground"}`}>
        Doctor Tracker
      </span>
    </div>
  );
}
