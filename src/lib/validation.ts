import { CONDITIONS, GENDERS } from "@/types";
import { todayDateString } from "./format";

/*
 * Validation rules shared by the forms (before sending) and the mock API (after receiving).
 * Each validate function returns an object of { field: "error message" }.
 * An empty object means the values are valid.
 */

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export interface DoctorFormValues {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
}

export interface PatientFormValues {
  name: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
  condition: string;
  diagnosis: string;
  doctorId: string;
  admittedAt: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,20}$/;

export function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(email.trim());
}

export function isValidPhone(phone: string) {
  return PHONE_PATTERN.test(phone.trim());
}

export function hasErrors<T>(errors: FormErrors<T>) {
  return Object.keys(errors).length > 0;
}

export function validateDoctor(values: DoctorFormValues) {
  const errors: FormErrors<DoctorFormValues> = {};

  if (values.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
  if (values.name.trim().length > 80) errors.name = "Name must be 80 characters or fewer";
  if (!values.specialization.trim()) errors.specialization = "Choose a specialization";
  if (values.hospital.trim().length < 2) errors.hospital = "Enter the hospital name";
  if (!isValidPhone(values.phone)) errors.phone = "Enter a valid phone number, e.g. +880 1712 345678";
  if (!isValidEmail(values.email)) errors.email = "Enter a valid email address";

  return errors;
}

export function validatePatient(values: PatientFormValues) {
  const errors: FormErrors<PatientFormValues> = {};
  const age = Number(values.age);

  if (values.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
  if (values.age.trim() === "" || !Number.isInteger(age) || age < 0 || age > 130) {
    errors.age = "Enter an age between 0 and 130";
  }
  if (!GENDERS.includes(values.gender as (typeof GENDERS)[number])) errors.gender = "Choose a gender";
  if (!isValidPhone(values.phone)) errors.phone = "Enter a valid phone number";
  if (values.email.trim() && !isValidEmail(values.email)) errors.email = "Enter a valid email address";
  if (!CONDITIONS.includes(values.condition as (typeof CONDITIONS)[number])) {
    errors.condition = "Choose a condition";
  }
  if (values.diagnosis.trim().length < 2) errors.diagnosis = "Enter a diagnosis";
  if (!values.doctorId) errors.doctorId = "Assign a doctor";

  if (!values.admittedAt) {
    errors.admittedAt = "Choose the admission date";
  } else if (values.admittedAt.slice(0, 10) > todayDateString()) {
    errors.admittedAt = "Admission date can't be in the future";
  }

  return errors;
}
