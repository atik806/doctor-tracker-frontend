"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CONDITIONS, GENDERS, type Patient } from "@/types";
import { addPatientToDoctor, ApiError, createPatient, errorMessage, updatePatient } from "@/lib/api";
import { CONDITION_LABELS, toDateInputValue, todayDateString } from "@/lib/format";
import { useFilterOptions, useRefreshData } from "@/lib/hooks";
import { hasErrors, validatePatient, type FormErrors, type PatientFormValues } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";

const CONDITION_OPTIONS = CONDITIONS.map((condition) => ({ value: condition, label: CONDITION_LABELS[condition] }));
const GENDER_OPTIONS = GENDERS.map((gender) => ({ value: gender, label: gender[0].toUpperCase() + gender.slice(1) }));

interface PatientFormModalProps {
  open: boolean;
  /** The patient to edit, or null to add a new one. */
  patient: Patient | null;
  /** When set, the patient is added under this doctor and the doctor can't be changed. */
  fixedDoctor?: { id: string; name: string };
  onClose: () => void;
}

export function PatientFormModal({ open, patient, fixedDoctor, onClose }: PatientFormModalProps) {
  let description = "Record a new patient and assign them to a doctor.";
  if (fixedDoctor) description = `This patient will be added to ${fixedDoctor.name}'s list.`;
  if (patient) description = "Update this patient's details.";

  return (
    <Modal open={open} onClose={onClose} size="lg" title={patient ? "Edit patient" : "Add patient"} description={description}>
      <PatientForm patient={patient} fixedDoctor={fixedDoctor} onDone={onClose} />
    </Modal>
  );
}

function initialValues(patient: Patient | null, fixedDoctorId?: string): PatientFormValues {
  if (!patient) {
    return {
      name: "",
      age: "",
      gender: "",
      phone: "",
      email: "",
      condition: "stable",
      diagnosis: "",
      doctorId: fixedDoctorId ?? "",
      admittedAt: todayDateString(),
    };
  }
  return {
    name: patient.name,
    age: String(patient.age),
    gender: patient.gender,
    phone: patient.phone,
    email: patient.email,
    condition: patient.condition,
    diagnosis: patient.diagnosis,
    doctorId: patient.doctorId,
    admittedAt: toDateInputValue(patient.admittedAt),
  };
}

interface PatientFormProps {
  patient: Patient | null;
  fixedDoctor?: { id: string; name: string };
  onDone: () => void;
}

function PatientForm({ patient, fixedDoctor, onDone }: PatientFormProps) {
  const [values, setValues] = useState(() => initialValues(patient, fixedDoctor?.id));
  const [errors, setErrors] = useState<FormErrors<PatientFormValues>>({});
  const options = useFilterOptions();
  const refreshData = useRefreshData();

  const mutation = useMutation({
    mutationFn: (formValues: PatientFormValues) => {
      if (patient) return updatePatient(patient.id, formValues);
      if (fixedDoctor) return addPatientToDoctor(fixedDoctor.id, formValues);
      return createPatient(formValues);
    },
    onSuccess: (saved) => {
      refreshData();
      toast.success(patient ? `${saved.name} updated` : `${saved.name} added`);
      onDone();
    },
    onError: (error) => {
      if (error instanceof ApiError) setErrors(error.errors ?? {});
      toast.error(errorMessage(error));
    },
  });

  function updateField(field: keyof PatientFormValues, value: string) {
    setValues({ ...values, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newErrors = validatePatient(values);
    setErrors(newErrors);
    if (hasErrors(newErrors)) return;
    mutation.mutate(values);
  }

  const doctorOptions = (options.data?.doctors ?? []).map((doctor) => ({ value: doctor.id, label: doctor.name }));

  let submitLabel = patient ? "Save changes" : "Add patient";
  if (mutation.isPending) submitLabel = "Saving…";

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField label="Full name" required autoFocus placeholder="Nusrat Akter" value={values.name}
            onChange={(event) => updateField("name", event.target.value)} error={errors.name} />
        </div>
        <TextField label="Age" required type="number" inputMode="numeric" min={0} max={130} placeholder="34"
          value={values.age} onChange={(event) => updateField("age", event.target.value)} error={errors.age} />
        <SelectField label="Gender" required placeholder="Choose a gender" options={GENDER_OPTIONS}
          value={values.gender} onChange={(event) => updateField("gender", event.target.value)} error={errors.gender} />
        <TextField label="Phone" required type="tel" placeholder="+880 1812 345678" value={values.phone}
          onChange={(event) => updateField("phone", event.target.value)} error={errors.phone} />
        <TextField label="Email" type="email" placeholder="Optional" value={values.email}
          onChange={(event) => updateField("email", event.target.value)} error={errors.email} />
        <SelectField label="Condition" required options={CONDITION_OPTIONS} value={values.condition}
          onChange={(event) => updateField("condition", event.target.value)} error={errors.condition} />
        <TextField label="Admission date" required type="date" max={todayDateString()} value={values.admittedAt}
          onChange={(event) => updateField("admittedAt", event.target.value)} error={errors.admittedAt} />
        <div className="sm:col-span-2">
          <TextField label="Diagnosis" required placeholder="e.g. Hypertension" value={values.diagnosis}
            onChange={(event) => updateField("diagnosis", event.target.value)} error={errors.diagnosis} />
        </div>
        {!fixedDoctor && (
          <div className="sm:col-span-2">
            <SelectField label="Assigned doctor" required placeholder="Choose a doctor" options={doctorOptions}
              value={values.doctorId} onChange={(event) => updateField("doctorId", event.target.value)}
              error={errors.doctorId} />
          </div>
        )}
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
