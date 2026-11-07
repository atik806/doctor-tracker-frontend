import type { Metadata } from "next";
import { Suspense } from "react";
import { DoctorsView } from "@/components/doctors/DoctorsView";
import PortalLoading from "../loading";

export const metadata: Metadata = { title: "Doctors" };

export default function DoctorsPage() {
  // DoctorsView reads the URL (useSearchParams), so it must sit inside Suspense.
  return (
    <Suspense fallback={<PortalLoading />}>
      <DoctorsView />
    </Suspense>
  );
}
