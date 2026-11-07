"use client";

import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";

// Shown when something unexpected breaks while rendering a portal page.
export default function PortalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Card>
      <ErrorState error={error} onRetry={reset} />
    </Card>
  );
}
