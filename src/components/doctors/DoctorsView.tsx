"use client";

import { useCallback, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Plus, SearchX, Stethoscope } from "lucide-react";
import type { Doctor } from "@/types";
import { getDoctors } from "@/lib/api";
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
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ReadOnlyNotice } from "@/components/ui/ReadOnlyNotice";
import { DeleteDoctorDialog } from "./DeleteDoctorDialog";
import { DoctorFilters } from "./DoctorFilters";
import { DoctorFormModal } from "./DoctorFormModal";
import { DoctorTable } from "./DoctorTable";

const DEFAULT_FILTERS = {
  search: "",
  specialization: "",
  hospital: "",
  from: "",
  to: "",
  sort: "-createdAt",
  page: "1",
  limit: "10",
};

const FILTER_KEYS = ["search", "specialization", "hospital", "from", "to"];

export function DoctorsView() {
  // 1. Filters come from the URL
  const { filters, updateFilters, clearFilters } = useUrlFilters(DEFAULT_FILTERS);
  const { isAdmin, isStaff } = useCurrentUser();
  const options = useFilterOptions();

  // 2. Fetch the current page
  const doctorsQuery = useQuery({
    queryKey: ["doctors", filters],
    queryFn: () => getDoctors(filters),
    placeholderData: keepPreviousData,
  });
  useKeepPageInRange(doctorsQuery.data?.meta);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);

  // Stable functions, so the memoised rows don't re-render when this page re-renders.
  const handleEdit = useCallback((doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsFormOpen(true);
  }, []);
  const handleDelete = useCallback((doctor: Doctor) => setDeletingDoctor(doctor), []);

  function handleAdd() {
    setEditingDoctor(null);
    setIsFormOpen(true);
  }

  const activeFilterCount = countActiveFilters(filters, FILTER_KEYS);
  const doctors = doctorsQuery.data?.data ?? [];
  const meta = doctorsQuery.data?.meta;

  // 3. Render the right state
  function renderContent() {
    // While jumping back from a page that no longer exists, keep showing the loading rows.
    if (doctorsQuery.isPending || isPageOutOfRange(meta)) return <TableSkeleton />;
    if (doctorsQuery.isError) return <ErrorState error={doctorsQuery.error} onRetry={() => doctorsQuery.refetch()} />;

    if (doctors.length === 0 && activeFilterCount > 0) {
      return (
        <EmptyState
          icon={SearchX}
          title="No doctors match your filters"
          message="Try a different search term or remove some filters."
          action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
        />
      );
    }
    if (doctors.length === 0) {
      return (
        <EmptyState
          icon={Stethoscope}
          title="No doctors yet"
          message="Add your first doctor to start assigning patients."
          action={isAdmin && <Button onClick={handleAdd}><Plus className="size-4" />Add doctor</Button>}
        />
      );
    }

    return (
      <div className={doctorsQuery.isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
        <DoctorTable
          doctors={doctors}
          sort={filters.sort}
          isAdmin={isAdmin}
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
        title="Doctors"
        description="Everyone on your medical team, with their patient load."
        actions={
          isAdmin && (
            <Button onClick={handleAdd}>
              <Plus className="size-4" />
              Add doctor
            </Button>
          )
        }
      />

      {isStaff && <ReadOnlyNotice />}

      <Card className="overflow-hidden">
        <DoctorFilters
          filters={filters}
          options={options.data}
          activeCount={activeFilterCount}
          onChange={updateFilters}
          onClear={clearFilters}
        />
        {renderContent()}
        {meta && doctors.length > 0 && (
          <Pagination
            meta={meta}
            onPageChange={(page) => updateFilters({ page: String(page) })}
            onLimitChange={(limit) => updateFilters({ limit: String(limit) })}
          />
        )}
      </Card>

      <DoctorFormModal open={isFormOpen} doctor={editingDoctor} onClose={() => setIsFormOpen(false)} />
      <DeleteDoctorDialog doctor={deletingDoctor} onClose={() => setDeletingDoctor(null)} />
    </>
  );
}
