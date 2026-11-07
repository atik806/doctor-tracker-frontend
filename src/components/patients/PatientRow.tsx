import { memo } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import type { Patient } from "@/types";
import { formatDate } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { ConditionBadge } from "@/components/ui/ConditionBadge";
import { IconButton } from "@/components/ui/IconButton";

export interface PatientRowProps {
  patient: Patient;
  isAdmin: boolean;
  showDoctor: boolean;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

function RowActions({ patient, isAdmin, onEdit, onDelete }: PatientRowProps) {
  if (!isAdmin) return null;
  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton label={`Edit ${patient.name}`} onClick={() => onEdit(patient)}>
        <Pencil className="size-4" />
      </IconButton>
      <IconButton label={`Delete ${patient.name}`} tone="danger" onClick={() => onDelete(patient)}>
        <Trash2 className="size-4" />
      </IconButton>
    </div>
  );
}

function genderAndAge(patient: Patient) {
  const gender = patient.gender[0].toUpperCase() + patient.gender.slice(1);
  return `${gender}, ${patient.age} yrs`;
}

/** One table row on desktop. Memoised so unrelated page updates don't re-render every row. */
export const PatientRow = memo(function PatientRow(props: PatientRowProps) {
  const { patient, showDoctor } = props;
  return (
    <tr className="transition-colors hover:bg-surface-muted/70">
      <td className="py-3 pr-3 pl-5">
        <div className="flex items-center gap-3">
          <Avatar name={patient.name} />
          <span className="min-w-0">
            <span className="block truncate font-semibold">{patient.name}</span>
            <span className="block truncate text-xs text-muted">{genderAndAge(patient)}</span>
          </span>
        </div>
      </td>
      <td className="px-3 py-3">
        <ConditionBadge condition={patient.condition} />
      </td>
      <td className="px-3 py-3 text-muted">{patient.diagnosis}</td>
      {showDoctor && (
        <td className="px-3 py-3">
          <Link href={`/doctors/${patient.doctorId}`} className="hover:text-primary hover:underline">
            {patient.doctorName}
          </Link>
        </td>
      )}
      <td className="hidden px-3 py-3 whitespace-nowrap text-muted tabular-nums xl:table-cell">{patient.phone}</td>
      <td className="px-3 py-3 whitespace-nowrap text-muted">{formatDate(patient.admittedAt)}</td>
      <td className="py-3 pr-5 pl-3">
        <RowActions {...props} />
      </td>
    </tr>
  );
});

/** The same patient as a stacked card on small screens. */
export const PatientCard = memo(function PatientCard(props: PatientRowProps) {
  const { patient, showDoctor } = props;
  return (
    <li className="p-4">
      <div className="flex items-start gap-3">
        <Avatar name={patient.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{patient.name}</p>
          <p className="text-sm text-muted">
            {genderAndAge(patient)} · {patient.diagnosis}
          </p>
          {showDoctor && (
            <Link href={`/doctors/${patient.doctorId}`} className="mt-1 block truncate text-xs text-primary">
              {patient.doctorName}
            </Link>
          )}
        </div>
        <ConditionBadge condition={patient.condition} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-subtle">Admitted {formatDate(patient.admittedAt)}</span>
        <RowActions {...props} />
      </div>
    </li>
  );
});
