export const CONDITIONS = ["stable", "recovering", "observation", "critical", "discharged"] as const;
export type Condition = (typeof CONDITIONS)[number];

export const GENDERS = ["male", "female", "other"] as const;
export type Gender = (typeof GENDERS)[number];

export type Role = "admin" | "staff";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount: number;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string;
  condition: Condition;
  diagnosis: string;
  doctorId: string;
  doctorName: string;
  admittedAt: string;
  createdAt: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface DoctorOption {
  id: string;
  name: string;
}

export interface FilterOptions {
  specializations: string[];
  hospitals: string[];
  doctors: DoctorOption[];
}

export type StatsRange = "7d" | "30d" | "90d" | "12m" | "all";

export interface TrendPoint {
  label: string;
  patients: number;
  doctors: number;
}

export interface Stats {
  totalDoctors: number;
  totalPatients: number;
  newDoctors: number;
  newPatients: number;
  previousNewPatients: number;
  criticalPatients: number;
  trend: TrendPoint[];
  patientsPerDoctor: { id: string; name: string; patients: number }[];
  byCondition: { condition: Condition; count: number }[];
  bySpecialization: { specialization: string; doctors: number; patients: number }[];
}
