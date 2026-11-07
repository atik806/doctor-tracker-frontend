import type { Patient } from "@/types";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { PatientCard, PatientRow } from "./PatientRow";

interface PatientTableProps {
  patients: Patient[];
  isAdmin: boolean;
  /** Hide the doctor column on a doctor's own page. */
  showDoctor?: boolean;
  /** Leave out to make the columns non-sortable. */
  sort?: string;
  onSort?: (sort: string) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

const headerCell = "px-3 py-3 text-left text-xs font-semibold tracking-wide text-muted uppercase";

export function PatientTable({
  patients,
  isAdmin,
  showDoctor = true,
  sort,
  onSort,
  onEdit,
  onDelete,
}: PatientTableProps) {
  const canSort = sort !== undefined && onSort !== undefined;

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted">
            <tr>
              {canSort ? (
                <SortableHeader label="Patient" field="name" sort={sort} onSort={onSort} className={`${headerCell} pl-5`} />
              ) : (
                <th scope="col" className={`${headerCell} pl-5`}>Patient</th>
              )}
              <th scope="col" className={headerCell}>Condition</th>
              <th scope="col" className={headerCell}>Diagnosis</th>
              {showDoctor && <th scope="col" className={headerCell}>Doctor</th>}
              <th scope="col" className={`${headerCell} hidden xl:table-cell`}>Phone</th>
              {canSort ? (
                <SortableHeader label="Admitted" field="admittedAt" sort={sort} onSort={onSort} className={headerCell} />
              ) : (
                <th scope="col" className={headerCell}>Admitted</th>
              )}
              <th scope="col" className={`${headerCell} pr-5`}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {patients.map((patient) => (
              <PatientRow key={patient.id} patient={patient} isAdmin={isAdmin} showDoctor={showDoctor}
                onEdit={onEdit} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border lg:hidden">
        {patients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} isAdmin={isAdmin} showDoctor={showDoctor}
            onEdit={onEdit} onDelete={onDelete} />
        ))}
      </ul>
    </>
  );
}
