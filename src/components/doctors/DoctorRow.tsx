import { memo } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { Doctor } from "@/types";
import { formatDate } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/IconButton";

export interface DoctorRowProps {
  doctor: Doctor;
  isAdmin: boolean;
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
}

function RowActions({ doctor, isAdmin, onEdit, onDelete }: DoctorRowProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/doctors/${doctor.id}`}
        title="View patients"
        aria-label={`View ${doctor.name}'s patients`}
        className="flex size-8 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        <Eye className="size-4" />
      </Link>
      {isAdmin && (
        <>
          <IconButton label={`Edit ${doctor.name}`} onClick={() => onEdit(doctor)}>
            <Pencil className="size-4" />
          </IconButton>
          <IconButton label={`Delete ${doctor.name}`} tone="danger" onClick={() => onDelete(doctor)}>
            <Trash2 className="size-4" />
          </IconButton>
        </>
      )}
    </div>
  );
}

function PatientCount({ count }: { count: number }) {
  return (
    <span className="inline-flex min-w-8 justify-center rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary tabular-nums">
      {count}
    </span>
  );
}

/** One table row on desktop. Memoised so typing in the search box doesn't re-render every row. */
export const DoctorRow = memo(function DoctorRow(props: DoctorRowProps) {
  const { doctor } = props;
  return (
    <tr className="transition-colors hover:bg-surface-muted/70">
      <td className="py-3 pr-3 pl-5">
        <Link href={`/doctors/${doctor.id}`} className="group flex items-center gap-3">
          <Avatar name={doctor.name} />
          <span className="min-w-0">
            <span className="block truncate font-semibold group-hover:text-primary">{doctor.name}</span>
            <span className="block truncate text-xs text-muted">{doctor.email}</span>
          </span>
        </Link>
      </td>
      <td className="px-3 py-3">{doctor.specialization}</td>
      <td className="px-3 py-3 text-muted">{doctor.hospital}</td>
      <td className="hidden px-3 py-3 whitespace-nowrap text-muted tabular-nums xl:table-cell">{doctor.phone}</td>
      <td className="px-3 py-3 text-center">
        <PatientCount count={doctor.patientCount} />
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-muted">{formatDate(doctor.createdAt)}</td>
      <td className="py-3 pr-5 pl-3">
        <RowActions {...props} />
      </td>
    </tr>
  );
});

/** The same doctor as a stacked card on small screens. */
export const DoctorCard = memo(function DoctorCard(props: DoctorRowProps) {
  const { doctor } = props;
  return (
    <li className="p-4">
      <div className="flex items-start gap-3">
        <Avatar name={doctor.name} />
        <div className="min-w-0 flex-1">
          <Link href={`/doctors/${doctor.id}`} className="block truncate font-semibold hover:text-primary">
            {doctor.name}
          </Link>
          <p className="text-sm text-muted">
            {doctor.specialization} · {doctor.hospital}
          </p>
          <p className="mt-1 truncate text-xs text-muted">
            {doctor.phone} · {doctor.email}
          </p>
        </div>
        <PatientCount count={doctor.patientCount} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-subtle">Added {formatDate(doctor.createdAt)}</span>
        <RowActions {...props} />
      </div>
    </li>
  );
});
