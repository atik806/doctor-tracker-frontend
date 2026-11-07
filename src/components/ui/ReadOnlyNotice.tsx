import { Lock } from "lucide-react";

/** Shown to staff users, who can view everything but can't make changes. */
export function ReadOnlyNotice() {
  return (
    <div className="mb-4 flex items-center gap-2.5 rounded-[10px] border border-border bg-surface px-4 py-3 text-sm text-muted">
      <Lock className="size-4 shrink-0 text-subtle" />
      You have read-only access. Ask an admin if you need to add, edit or delete records.
    </div>
  );
}
