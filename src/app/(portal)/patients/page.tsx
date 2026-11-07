import type { Metadata } from "next";
import { Suspense } from "react";
import { PatientsView } from "@/components/patients/PatientsView";
import PortalLoading from "../loading";

export const metadata: Metadata = { title: "Patients" };

export default function PatientsPage() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <PatientsView />
    </Suspense>
  );
}
