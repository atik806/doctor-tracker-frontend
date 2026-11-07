import type { Doctor } from "@/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { DoctorCard, DoctorRow } from "./DoctorRow";

interface DoctorTableProps {
  doctors: Doctor[];
  sort: string;
  isAdmin: boolean;
  onSort: (sort: string) => void;
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
}

const headerCell = "px-3 py-3 text-left text-xs font-semibold tracking-wide text-muted uppercase";

export function DoctorTable({ doctors, sort, isAdmin, onSort, onEdit, onDelete }: DoctorTableProps) {
  return (
    <>
      {/* Laptops and desktops: a table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted">
            <tr>
              <SortableHeader label="Doctor" field="name" sort={sort} onSort={onSort} className={`${headerCell} pl-5`} />
              <th scope="col" className={headerCell}>Specialization</th>
              <th scope="col" className={headerCell}>Hospital</th>
              <th scope="col" className={`${headerCell} hidden xl:table-cell`}>Phone</th>
              <SortableHeader label="Patients" field="patientCount" sort={sort} onSort={onSort} className={`${headerCell} text-center`} />
              <SortableHeader label="Added" field="createdAt" sort={sort} onSort={onSort} className={headerCell} />
              <th scope="col" className={`${headerCell} pr-5 text-right`}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {doctors.map((doctor) => (
              <DoctorRow key={doctor.id} doctor={doctor} isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones and tablets: stacked cards */}
      <ul className="divide-y divide-border lg:hidden">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </ul>
    </>
  );
}
