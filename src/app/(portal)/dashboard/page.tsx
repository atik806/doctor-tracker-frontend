import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardView } from "@/components/dashboard/DashboardView";
import PortalLoading from "../loading";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <DashboardView />
    </Suspense>
  );
}
