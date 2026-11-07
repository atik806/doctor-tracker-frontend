import { Building2, CalendarDays, Mail, Phone, UsersRound } from "lucide-react";
import type { Doctor } from "@/types";
import { formatDate } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";

function DetailItem({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-muted text-muted">
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="truncate text-sm font-medium" title={value}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function DoctorProfileCard({ doctor }: { doctor: Doctor }) {
  return (
    <Card className="mb-6 p-5 sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4 lg:w-72">
          <Avatar name={doctor.name} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight">{doctor.name}</h1>
            <span className="mt-1 inline-flex rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
              {doctor.specialization}
            </span>
          </div>
        </div>
        <div className="grid min-w-0 flex-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <DetailItem icon={Building2} label="Hospital" value={doctor.hospital} />
          <DetailItem icon={Phone} label="Phone" value={doctor.phone} />
          <DetailItem icon={Mail} label="Email" value={doctor.email} />
          <DetailItem icon={CalendarDays} label="Added" value={formatDate(doctor.createdAt)} />
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-primary-soft px-4 py-3 lg:flex-col lg:items-start lg:gap-0">
          <UsersRound className="size-5 text-primary lg:mb-1" strokeWidth={1.75} />
          <p className="text-2xl font-semibold text-primary tabular-nums">{doctor.patientCount}</p>
          <p className="text-xs font-medium text-primary/80">{doctor.patientCount === 1 ? "patient" : "patients"}</p>
        </div>
      </div>
    </Card>
  );
}
