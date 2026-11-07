"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Patient } from "@/types";
import { deletePatient, errorMessage } from "@/lib/api";
import { useRefreshData } from "@/lib/hooks";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface DeletePatientDialogProps {
  patient: Patient | null;
  onClose: () => void;
}

export function DeletePatientDialog({ patient, onClose }: DeletePatientDialogProps) {
  const refreshData = useRefreshData();

  const mutation = useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: () => {
      toast.success(`${patient?.name} deleted`);
      onClose();
      refreshData();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <ConfirmDialog
      open={patient !== null}
      title="Delete patient?"
      confirmLabel="Delete patient"
      isPending={mutation.isPending}
      onClose={onClose}
      onConfirm={() => patient && mutation.mutate(patient.id)}
      message={
        patient && (
          <>
            <strong className="font-semibold text-foreground">{patient.name}</strong> will be removed from{" "}
            {patient.doctorName}&apos;s list and deleted permanently. This can&apos;t be undone.
          </>
        )
      }
    />
  );
}
