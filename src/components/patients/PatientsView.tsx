"use client";

import { useCallback, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Plus, SearchX, UsersRound } from "lucide-react";
import type { Patient } from "@/types";
import { getPatients } from "@/lib/api";
import {
  countActiveFilters,
  isPageOutOfRange,
  useCurrentUser,
  useFilterOptions,
  useKeepPageInRange,
  useUrlFilters,
} from "@/lib/hooks";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { ReadOnlyNotice } from "@/components/ui/ReadOnlyNotice";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { DeletePatientDialog } from "./DeletePatientDialog";
import { PatientFilters } from "./PatientFilters";
import { PatientFormModal } from "./PatientFormModal";
import { PatientTable } from "./PatientTable";

const DEFAULT_FILTERS = {
  search: "",
  condition: "",
  doctorId: "",
  gender: "",
  from: "",
  to: "",
  sort: "-admittedAt",
  page: "1",
  limit: "10",
};

const FILTER_KEYS = ["search", "condition", "doctorId", "gender", "from", "to"];

export function PatientsView() {
  // 1. Filters come from the URL
  const { filters, updateFilters, clearFilters } = useUrlFilters(DEFAULT_FILTERS);
  const { isAdmin, isStaff } = useCurrentUser();
  const options = useFilterOptions();

  // 2. Fetch the current page
  const patientsQuery = useQuery({
    queryKey: ["patients", filters],
    queryFn: () => getPatients(filters),
    placeholderData: keepPreviousData,
  });
  useKeepPageInRange(patientsQuery.data?.meta);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  const handleEdit = useCallback((patient: Patient) => {
    setEditingPatient(patient);
    setIsFormOpen(true);
  }, []);
  const handleDelete = useCallback((patient: Patient) => setDeletingPatient(patient), []);

  function handleAdd() {
    setEditingPatient(null);
    setIsFormOpen(true);
  }

  const activeFilterCount = countActiveFilters(filters, FILTER_KEYS);
  const patients = patientsQuery.data?.data ?? [];
  const meta = patientsQuery.data?.meta;

  // 3. Render the right state
  function renderContent() {
    // While jumping back from a page that no longer exists, keep showing the loading rows.
    if (patientsQuery.isPending || isPageOutOfRange(meta)) return <TableSkeleton />;
    if (patientsQuery.isError) return <ErrorState error={patientsQuery.error} onRetry={() => patientsQuery.refetch()} />;

    if (patients.length === 0 && activeFilterCount > 0) {
      return (
        <EmptyState
          icon={SearchX}
          title="No patients match your filters"
          message="Try a different search term or remove some filters."
          action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
        />
      );
    }
    if (patients.length === 0) {
      return (
        <EmptyState
          icon={UsersRound}
          title="No patients yet"
          message="Patients you add will appear here."
          action={isAdmin && <Button onClick={handleAdd}><Plus className="size-4" />Add patient</Button>}
        />
      );
    }

    return (
      <div className={patientsQuery.isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
        <PatientTable
          patients={patients}
          isAdmin={isAdmin}
          sort={filters.sort}
          onSort={(sort) => updateFilters({ sort })}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Patients"
        description="Every patient across all doctors, with their current condition."
        actions={
          isAdmin && (
            <Button onClick={handleAdd}>
              <Plus className="size-4" />
              Add patient
            </Button>
          )
        }
      />

      {isStaff && <ReadOnlyNotice />}

      <Card className="overflow-hidden">
        <PatientFilters
          filters={filters}
          options={options.data}
          activeCount={activeFilterCount}
          onChange={updateFilters}
          onClear={clearFilters}
        />
        {renderContent()}
        {meta && patients.length > 0 && (
          <Pagination
            meta={meta}
            onPageChange={(page) => updateFilters({ page: String(page) })}
            onLimitChange={(limit) => updateFilters({ limit: String(limit) })}
          />
        )}
      </Card>

      <PatientFormModal open={isFormOpen} patient={editingPatient} onClose={() => setIsFormOpen(false)} />
      <DeletePatientDialog patient={deletingPatient} onClose={() => setDeletingPatient(null)} />
    </>
  );
}
