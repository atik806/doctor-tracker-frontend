import type { Doctor, Paginated, Patient } from "@/types";
import { createSeedData, type DoctorRecord, type PatientRecord } from "./data";

/*
 * In-memory "database" for the mock API.
 * It is stored on globalThis so the data survives Next.js hot reloads during development.
 */

interface Database {
  doctors: DoctorRecord[];
  patients: PatientRecord[];
  nextId: number;
}

const globalStore = globalThis as unknown as { doctorTrackerDb?: Database };

if (!globalStore.doctorTrackerDb) {
  globalStore.doctorTrackerDb = { ...createSeedData(), nextId: 1000 };
}

export const db = globalStore.doctorTrackerDb;

export function newId(prefix: string) {
  db.nextId += 1;
  return `${prefix}-${db.nextId}`;
}

/* ---------- Reading query parameters ---------- */

const MAX_LIMIT = 100;

export function readPagination(params: URLSearchParams) {
  let page = Number(params.get("page"));
  let limit = Number(params.get("limit"));
  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = 10;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;
  return { page, limit };
}

/** True when `isoDate` is inside the optional "from" / "to" dates (both inclusive, YYYY-MM-DD). */
function isInDateRange(isoDate: string, from: string | null, to: string | null) {
  const day = isoDate.slice(0, 10);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

function includesText(value: string, search: string) {
  return value.toLowerCase().includes(search);
}

/** Sort a copy of `items`. `sort` looks like "name" (A→Z) or "-createdAt" (newest first). */
function sortItems<T>(items: T[], sort: string, allowed: (keyof T)[]) {
  const descending = sort.startsWith("-");
  const field = (descending ? sort.slice(1) : sort) as keyof T;
  if (!allowed.includes(field)) return items;

  const sorted = [...items].sort((a, b) => {
    if (a[field] < b[field]) return -1;
    if (a[field] > b[field]) return 1;
    return 0;
  });
  if (descending) sorted.reverse();
  return sorted;
}

function paginate<T>(items: T[], page: number, limit: number): Paginated<T> {
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: {
      page,
      limit,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / limit)),
    },
  };
}

/* ---------- Doctors ---------- */

/** Count patients for every doctor in one pass (the MongoDB version is one $group query). */
export function countPatientsByDoctor() {
  const counts = new Map<string, number>();
  for (const patient of db.patients) {
    counts.set(patient.doctorId, (counts.get(patient.doctorId) ?? 0) + 1);
  }
  return counts;
}

export function toDoctor(record: DoctorRecord, counts: Map<string, number>): Doctor {
  return { ...record, patientCount: counts.get(record.id) ?? 0 };
}

export function findDoctors(params: URLSearchParams) {
  const search = (params.get("search") ?? "").trim().toLowerCase();
  const specialization = params.get("specialization");
  const hospital = params.get("hospital");
  const from = params.get("from");
  const to = params.get("to");

  const matches = db.doctors.filter((doctor) => {
    if (specialization && doctor.specialization !== specialization) return false;
    if (hospital && doctor.hospital !== hospital) return false;
    if (!isInDateRange(doctor.createdAt, from, to)) return false;
    if (!search) return true;
    return (
      includesText(doctor.name, search) ||
      includesText(doctor.email, search) ||
      includesText(doctor.hospital, search)
    );
  });

  const counts = countPatientsByDoctor();
  const doctors = matches.map((record) => toDoctor(record, counts));
  const sorted = sortItems(doctors, params.get("sort") || "-createdAt", ["name", "createdAt", "patientCount"]);
  const { page, limit } = readPagination(params);
  return paginate(sorted, page, limit);
}

export function findDoctorById(id: string) {
  return db.doctors.find((doctor) => doctor.id === id);
}

export function isEmailTaken(email: string, exceptDoctorId?: string) {
  const normalized = email.trim().toLowerCase();
  return db.doctors.some((doctor) => doctor.email === normalized && doctor.id !== exceptDoctorId);
}

/* ---------- Patients ---------- */

export function toPatient(record: PatientRecord): Patient {
  const doctor = findDoctorById(record.doctorId);
  return { ...record, doctorName: doctor ? doctor.name : "Unassigned" };
}

export function findPatients(params: URLSearchParams, onlyDoctorId?: string) {
  const search = (params.get("search") ?? "").trim().toLowerCase();
  const condition = params.get("condition");
  const gender = params.get("gender");
  const doctorId = onlyDoctorId ?? params.get("doctorId");
  const from = params.get("from");
  const to = params.get("to");

  const matches = db.patients.filter((patient) => {
    if (doctorId && patient.doctorId !== doctorId) return false;
    if (condition && patient.condition !== condition) return false;
    if (gender && patient.gender !== gender) return false;
    if (!isInDateRange(patient.admittedAt, from, to)) return false;
    if (!search) return true;
    return (
      includesText(patient.name, search) ||
      includesText(patient.phone, search) ||
      includesText(patient.diagnosis, search)
    );
  });

  const sorted = sortItems(matches, params.get("sort") || "-admittedAt", ["name", "admittedAt", "age"]);
  const { page, limit } = readPagination(params);
  const result = paginate(sorted, page, limit);
  return { data: result.data.map(toPatient), meta: result.meta };
}

export function findPatientById(id: string) {
  return db.patients.find((patient) => patient.id === id);
}
