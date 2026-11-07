"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Plus, SearchX, Trash2, UserRoundSearch, UsersRound } from "lucide-react";
import type { Patient } from "@/types";
import { ApiError, getDoctor, getDoctorPatients } from "@/lib/api";
import { isPageOutOfRange, useCurrentUser, useKeepPageInRange, useUrlFilters } from "@/lib/hooks";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { DeletePatientDialog } from "@/components/patients/DeletePatientDialog";
import { PatientFormModal } from "@/components/patients/PatientFormModal";
import { PatientTable } from "@/components/patients/PatientTable";
import { DeleteDoctorDialog } from "./DeleteDoctorDialog";
import { DoctorFormModal } from "./DoctorFormModal";
import { DoctorProfileCard } from "./DoctorProfileCard";

const DEFAULT_FILTERS = { search: "", page: "1", limit: "10" };

export function DoctorDetailView({ doctorId }: { doctorId: string }) {
  const router = useRouter();
  const { isAdmin } = useCurrentUser();
  const { filters, updateFilters } = useUrlFilters(DEFAULT_FILTERS);

  const doctorQuery = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => getDoctor(doctorId),
  });
  const patientsQuery = useQuery({
    queryKey: ["patients", "by-doctor", doctorId, filters],
    queryFn: () => getDoctorPatients(doctorId, filters),
    placeholderData: keepPreviousData,
    enabled: doctorQuery.isSuccess,
  });
  useKeepPageInRange(patientsQuery.data?.meta);

  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [isDoctorFormOpen, setIsDoctorFormOpen] = useState(false);
  const [isDeletingDoctor, setIsDeletingDoctor] = useState(false);

  const handleEditPatient = useCallback((patient: Patient) => {
    setEditingPatient(patient);
    setIsPatientFormOpen(true);
  }, []);
  const handleDeletePatient = useCallback((patient: Patient) => setDeletingPatient(patient), []);

  function handleAddPatient() {
    setEditingPatient(null);
    setIsPatientFormOpen(true);
  }

  const backLink = (
    <Link href="/doctors" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground">
      <ArrowLeft className="size-4" />
      All doctors
    </Link>
  );

  if (doctorQuery.isPending) {
    return (
      <>
        {backLink}
        <Skeleton className="mb-6 h-32 w-full rounded-xl" />
        <Card><TableSkeleton /></Card>
      </>
    );
  }

  if (doctorQuery.isError) {
    const isMissing = doctorQuery.error instanceof ApiError && doctorQuery.error.status === 404;
    return (
      <>
        {backLink}
        <Card>
          {isMissing ? (
            <EmptyState
              icon={UserRoundSearch}
              title="Doctor not found"
              message="This doctor may have been deleted, or the link is wrong."
              action={<Link href="/doctors" className={buttonClasses("secondary")}>Back to doctors</Link>}
            />
          ) : (
            <ErrorState error={doctorQuery.error} onRetry={() => doctorQuery.refetch()} />
          )}
        </Card>
      </>
    );
  }

  const doctor = doctorQuery.data;
  const patients = patientsQuery.data?.data ?? [];
  const meta = patientsQuery.data?.meta;

  function renderPatients() {
    if (patientsQuery.isPending || isPageOutOfRange(meta)) return <TableSkeleton rows={4} />;
    if (patientsQuery.isError) return <ErrorState error={patientsQuery.error} onRetry={() => patientsQuery.refetch()} />;
    if (patients.length === 0 && filters.search) {
      return (
        <EmptyState icon={SearchX} title="No matching patients" message={`No patients match "${filters.search}".`}
          action={<Button variant="secondary" onClick={() => updateFilters({ search: "" })}>Clear search</Button>} />
      );
    }
    if (patients.length === 0) {
      return (
        <EmptyState icon={UsersRound} title="No patients yet" message={`${doctor.name} has no patients assigned.`}
          action={isAdmin && <Button onClick={handleAddPatient}><Plus className="size-4" />Add patient</Button>} />
      );
    }
    return (
      <div className={patientsQuery.isPlaceholderData ? "opacity-60" : ""}>
        <PatientTable patients={patients} isAdmin={isAdmin} showDoctor={false}
          onEdit={handleEditPatient} onDelete={handleDeletePatient} />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        {backLink}
        {isAdmin && (
          <div className="mb-4 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsDoctorFormOpen(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button variant="danger-outline" size="sm" onClick={() => setIsDeletingDoctor(true)}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <DoctorProfileCard doctor={doctor} />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-semibold">Patients</h2>
            <p className="text-sm text-muted">Patients currently assigned to {doctor.name}.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput className="sm:w-64" value={filters.search} placeholder="Search patients"
              onChange={(search) => updateFilters({ search })} />
            {isAdmin && (
              <Button onClick={handleAddPatient}>
                <Plus className="size-4" />
                Add patient
              </Button>
            )}
          </div>
        </div>
        {renderPatients()}
        {meta && patients.length > 0 && (
          <Pagination meta={meta} onPageChange={(page) => updateFilters({ page: String(page) })}
            onLimitChange={(limit) => updateFilters({ limit: String(limit) })} />
        )}
      </Card>

      <PatientFormModal open={isPatientFormOpen} patient={editingPatient}
        fixedDoctor={editingPatient ? undefined : { id: doctor.id, name: doctor.name }}
        onClose={() => setIsPatientFormOpen(false)} />
      <DeletePatientDialog patient={deletingPatient} onClose={() => setDeletingPatient(null)} />
      <DoctorFormModal open={isDoctorFormOpen} doctor={doctor} onClose={() => setIsDoctorFormOpen(false)} />
      <DeleteDoctorDialog doctor={isDeletingDoctor ? doctor : null} onClose={() => setIsDeletingDoctor(false)}
        onDeleted={() => router.replace("/doctors")} />
    </>
  );
}
