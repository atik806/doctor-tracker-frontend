import type { Condition, Stats, StatsRange } from "@/types";
import { CONDITIONS } from "@/types";
import { db } from "./store";

/*
 * Dashboard numbers for the mock API. In the real backend each block below is one
 * MongoDB aggregation pipeline ($match on dates → $group), so counting happens in the database.
 */

type BucketSize = "day" | "week" | "month";

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS: Record<StatsRange, number | null> = { "7d": 7, "30d": 30, "90d": 90, "12m": 365, all: null };

function getBucketSize(range: StatsRange): BucketSize {
  if (range === "7d" || range === "30d") return "day";
  if (range === "90d") return "week";
  return "month";
}

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** The first moment of the bucket that `date` falls into. */
function bucketStart(date: Date, size: BucketSize) {
  const day = startOfDay(date);
  if (size === "day") return day;
  if (size === "week") {
    const daysSinceMonday = (day.getUTCDay() + 6) % 7;
    return new Date(day.getTime() - daysSinceMonday * DAY_MS);
  }
  return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1));
}

function nextBucket(date: Date, size: BucketSize) {
  if (size === "day") return new Date(date.getTime() + DAY_MS);
  if (size === "week") return new Date(date.getTime() + 7 * DAY_MS);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
}

function bucketLabel(date: Date, size: BucketSize) {
  if (size === "month") {
    return date.toLocaleDateString("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" });
  }
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

function earliestDate() {
  let earliest = Date.now();
  for (const doctor of db.doctors) earliest = Math.min(earliest, new Date(doctor.createdAt).getTime());
  // An admission can be older than the doctor's record (e.g. an old patient typed in later).
  for (const patient of db.patients) earliest = Math.min(earliest, new Date(patient.admittedAt).getTime());
  return new Date(earliest);
}

/**
 * Builds one point per day/week/month from `from` to the latest admission (or today), filling empty buckets with 0.
 * Admission dates are calendar days at midnight UTC, so in time zones ahead of UTC today's admissions
 * can be just after the current UTC time. Going up to the latest one keeps them on the chart.
 */
function buildTrend(from: Date, size: BucketSize) {
  let lastTime = Date.now();
  for (const patient of db.patients) lastTime = Math.max(lastTime, new Date(patient.admittedAt).getTime());

  const points = new Map<number, { label: string; patients: number; doctors: number }>();
  for (let cursor = bucketStart(from, size); cursor.getTime() <= lastTime; cursor = nextBucket(cursor, size)) {
    points.set(cursor.getTime(), { label: bucketLabel(cursor, size), patients: 0, doctors: 0 });
  }

  for (const patient of db.patients) {
    const point = points.get(bucketStart(new Date(patient.admittedAt), size).getTime());
    if (point && new Date(patient.admittedAt) >= from) point.patients += 1;
  }
  for (const doctor of db.doctors) {
    const point = points.get(bucketStart(new Date(doctor.createdAt), size).getTime());
    if (point && new Date(doctor.createdAt) >= from) point.doctors += 1;
  }

  return Array.from(points.values());
}

export function buildStats(range: StatsRange): Stats {
  const days = RANGE_DAYS[range];
  const now = Date.now();
  const from = days === null ? earliestDate() : new Date(now - days * DAY_MS);
  const previousFrom = days === null ? null : new Date(now - 2 * days * DAY_MS);

  const patientsInRange = db.patients.filter((patient) => new Date(patient.admittedAt) >= from);

  let previousNewPatients = 0;
  if (previousFrom) {
    for (const patient of db.patients) {
      const admitted = new Date(patient.admittedAt);
      if (admitted >= previousFrom && admitted < from) previousNewPatients += 1;
    }
  }

  // Patients per doctor (inside the range), top 10.
  const perDoctor = new Map<string, number>();
  for (const patient of patientsInRange) {
    perDoctor.set(patient.doctorId, (perDoctor.get(patient.doctorId) ?? 0) + 1);
  }
  const patientsPerDoctor = db.doctors
    .map((doctor) => ({ id: doctor.id, name: doctor.name, patients: perDoctor.get(doctor.id) ?? 0 }))
    .filter((item) => item.patients > 0)
    .sort((a, b) => b.patients - a.patients)
    .slice(0, 10);

  // Patients by condition (inside the range).
  const conditionCounts = new Map<Condition, number>();
  for (const patient of patientsInRange) {
    conditionCounts.set(patient.condition, (conditionCounts.get(patient.condition) ?? 0) + 1);
  }
  const byCondition = CONDITIONS.map((condition) => ({ condition, count: conditionCounts.get(condition) ?? 0 }));

  // Doctors (all) and patients (inside the range) per specialization.
  const specializations = new Map<string, { doctors: number; patients: number }>();
  const doctorSpecialization = new Map<string, string>();
  for (const doctor of db.doctors) {
    doctorSpecialization.set(doctor.id, doctor.specialization);
    const entry = specializations.get(doctor.specialization) ?? { doctors: 0, patients: 0 };
    entry.doctors += 1;
    specializations.set(doctor.specialization, entry);
  }
  for (const patient of patientsInRange) {
    const entry = specializations.get(doctorSpecialization.get(patient.doctorId) ?? "");
    if (entry) entry.patients += 1;
  }
  const bySpecialization = Array.from(specializations.entries())
    .map(([specialization, counts]) => ({ specialization, ...counts }))
    .sort((a, b) => b.patients - a.patients);

  return {
    totalDoctors: db.doctors.length,
    totalPatients: db.patients.length,
    newDoctors: db.doctors.filter((doctor) => new Date(doctor.createdAt) >= from).length,
    newPatients: patientsInRange.length,
    previousNewPatients,
    criticalPatients: db.patients.filter((patient) => patient.condition === "critical").length,
    trend: buildTrend(from, getBucketSize(range)),
    patientsPerDoctor,
    byCondition,
    bySpecialization,
  };
}

export function readRange(value: string | null): StatsRange {
  if (value === "7d" || value === "30d" || value === "90d" || value === "12m" || value === "all") return value;
  return "30d";
}
