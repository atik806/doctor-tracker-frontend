import type { Metadata } from "next";
import { Suspense } from "react";
import { DoctorDetailView } from "@/components/doctors/DoctorDetailView";
import PortalLoading from "../../loading";

export const metadata: Metadata = { title: "Doctor" };

export default function DoctorDetailPage({ params }: PageProps<"/doctors/[id]">) {
  return (
    <Suspense fallback={<PortalLoading />}>
      <DoctorPage params={params} />
    </Suspense>
  );
}

// Reading params is async in Next.js 16, so it happens inside Suspense.
async function DoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DoctorDetailView doctorId={id} />;
}
