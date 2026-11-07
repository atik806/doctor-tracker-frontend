"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Doctor } from "@/types";
import { ApiError, createDoctor, errorMessage, updateDoctor } from "@/lib/api";
import { useFilterOptions, useRefreshData } from "@/lib/hooks";
import { hasErrors, validateDoctor, type DoctorFormValues, type FormErrors } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";

interface DoctorFormModalProps {
  open: boolean;
  /** The doctor to edit, or null to add a new one. */
  doctor: Doctor | null;
  onClose: () => void;
}

export function DoctorFormModal({ open, doctor, onClose }: DoctorFormModalProps) {
  const isEditing = doctor !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEditing ? "Edit doctor" : "Add doctor"}
      description={isEditing ? "Update this doctor's details." : "Add a doctor so you can assign patients to them."}
    >
      <DoctorForm doctor={doctor} onDone={onClose} />
    </Modal>
  );
}

function initialValues(doctor: Doctor | null): DoctorFormValues {
  if (!doctor) return { name: "", specialization: "", hospital: "", phone: "", email: "" };
  return {
    name: doctor.name,
    specialization: doctor.specialization,
    hospital: doctor.hospital,
    phone: doctor.phone,
    email: doctor.email,
  };
}

function DoctorForm({ doctor, onDone }: { doctor: Doctor | null; onDone: () => void }) {
  const [values, setValues] = useState(() => initialValues(doctor));
  const [errors, setErrors] = useState<FormErrors<DoctorFormValues>>({});
  const options = useFilterOptions();
  const refreshData = useRefreshData();

  const mutation = useMutation({
    mutationFn: (formValues: DoctorFormValues) => {
      if (doctor) return updateDoctor(doctor.id, formValues);
      return createDoctor(formValues);
    },
    onSuccess: (saved) => {
      refreshData();
      toast.success(doctor ? `${saved.name} updated` : `${saved.name} added`);
      onDone();
    },
    onError: (error) => {
      // Show server-side field errors (e.g. "email already in use") under the right field.
      if (error instanceof ApiError) setErrors(error.errors ?? {});
      toast.error(errorMessage(error));
    },
  });

  function updateField(field: keyof DoctorFormValues, value: string) {
    setValues({ ...values, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newErrors = validateDoctor(values);
    setErrors(newErrors);
    if (hasErrors(newErrors)) return;
    mutation.mutate(values);
  }

  const specializationOptions = (options.data?.specializations ?? []).map((name) => ({ value: name, label: name }));

  let submitLabel = doctor ? "Save changes" : "Add doctor";
  if (mutation.isPending) submitLabel = "Saving…";

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField
            label="Full name"
            required
            autoFocus
            placeholder="Dr. Ayesha Rahman"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            error={errors.name}
          />
        </div>
        <SelectField
          label="Specialization"
          required
          placeholder="Choose a specialization"
          options={specializationOptions}
          value={values.specialization}
          onChange={(event) => updateField("specialization", event.target.value)}
          error={errors.specialization}
        />
        <TextField
          label="Hospital"
          required
          list="hospital-suggestions"
          placeholder="Square Hospital"
          value={values.hospital}
          onChange={(event) => updateField("hospital", event.target.value)}
          error={errors.hospital}
        />
        <datalist id="hospital-suggestions">
          {(options.data?.hospitals ?? []).map((hospital) => (
            <option key={hospital} value={hospital} />
          ))}
        </datalist>
        <TextField
          label="Phone"
          required
          type="tel"
          placeholder="+880 1712 345678"
          value={values.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          error={errors.phone}
        />
        <TextField
          label="Email"
          required
          type="email"
          placeholder="name@clinic.com"
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          error={errors.email}
        />
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" isLoading={mutation.isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
