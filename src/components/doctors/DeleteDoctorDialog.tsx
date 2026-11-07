"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Doctor } from "@/types";
import { deleteDoctor, errorMessage } from "@/lib/api";
import { useRefreshData } from "@/lib/hooks";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface DeleteDoctorDialogProps {
  doctor: Doctor | null;
  onClose: () => void;
  onDeleted?: () => void;
}

function patientWarning(count: number) {
  if (count === 0) return "They have no patients.";
  if (count === 1) return "Their 1 patient will also be deleted.";
  return `Their ${count} patients will also be deleted.`;
}

export function DeleteDoctorDialog({ doctor, onClose, onDeleted }: DeleteDoctorDialogProps) {
  const refreshData = useRefreshData();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteDoctor(id),
    onSuccess: () => {
      toast.success(`${doctor?.name} deleted`);
      onClose();
      onDeleted?.();
      refreshData();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <ConfirmDialog
      open={doctor !== null}
      title="Delete doctor?"
      confirmLabel="Delete doctor"
      isPending={mutation.isPending}
      onClose={onClose}
      onConfirm={() => doctor && mutation.mutate(doctor.id)}
      message={
        doctor && (
          <>
            <strong className="font-semibold text-foreground">{doctor.name}</strong> will be removed permanently.{" "}
            {patientWarning(doctor.patientCount)} This can&apos;t be undone.
          </>
        )
      }
    />
  );
}
