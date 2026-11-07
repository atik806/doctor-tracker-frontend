import type { Condition, Gender } from "@/types";
import type { DoctorFormValues, PatientFormValues } from "@/lib/validation";
import type { DoctorRecord, PatientRecord } from "./data";
import { text } from "./http";

/* Convert a request body into form values (all strings) so the shared validators can check them. */

export function readDoctorValues(body: Record<string, unknown>): DoctorFormValues {
  return {
    name: text(body.name),
    specialization: text(body.specialization),
    hospital: text(body.hospital),
    phone: text(body.phone),
    email: text(body.email).toLowerCase(),
  };
}

export function readPatientValues(body: Record<string, unknown>): PatientFormValues {
  return {
    name: text(body.name),
    age: text(body.age),
    gender: text(body.gender),
    phone: text(body.phone),
    email: text(body.email).toLowerCase(),
    condition: text(body.condition),
    diagnosis: text(body.diagnosis),
    doctorId: text(body.doctorId),
    admittedAt: text(body.admittedAt),
  };
}

/** Builds the stored patient fields from values that already passed validation. */
export function patientFieldsFrom(values: PatientFormValues): Omit<PatientRecord, "id" | "createdAt"> {
  return {
    name: values.name,
    age: Number(values.age),
    gender: values.gender as Gender,
    phone: values.phone,
    email: values.email,
    condition: values.condition as Condition,
    diagnosis: values.diagnosis,
    doctorId: values.doctorId,
    admittedAt: new Date(values.admittedAt).toISOString(),
  };
}

export function doctorFieldsFrom(values: DoctorFormValues): Omit<DoctorRecord, "id" | "createdAt"> {
  return { ...values };
}
