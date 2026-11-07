import { RotateCw, WifiOff } from "lucide-react";
import { errorMessage } from "@/lib/api";
import { Button } from "./Button";

interface ErrorStateProps {
  error: unknown;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <WifiOff className="size-6" strokeWidth={1.75} />
      </div>
      <h3 className="text-base font-semibold">We couldn&apos;t load this</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{errorMessage(error)}</p>
      <Button variant="secondary" className="mt-5" onClick={onRetry}>
        <RotateCw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
