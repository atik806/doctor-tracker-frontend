import type { Condition, Gender } from "@/types";

/*
 * Demo data for the mock API. It plays the role of the MongoDB collections
 * until the real Express backend is connected.
 */

export interface DoctorRecord {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string;
  condition: Condition;
  diagnosis: string;
  doctorId: string;
  admittedAt: string;
  createdAt: string;
}

export const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "ENT",
  "General Medicine",
  "Gynecology",
  "Neurology",
  "Oncology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
];

const HOSPITALS = [
  "Square Hospital",
  "Evercare Hospital",
  "United Hospital",
  "Labaid Specialized Hospital",
  "Ibn Sina Hospital",
  "Popular Medical College",
];

const FIRST_NAMES = [
  "Ayesha", "Rafiq", "Nusrat", "Tanvir", "Farhana", "Imran", "Sadia", "Kamal", "Mehnaz", "Arif",
  "Lamia", "Zahid", "Tasnim", "Habib", "Rumana", "Shakil", "Nabila", "Jahid", "Sumaiya", "Rakib",
];

const LAST_NAMES = [
  "Rahman", "Hossain", "Ahmed", "Chowdhury", "Islam", "Karim", "Siddiqui", "Akter", "Haque", "Alam",
  "Uddin", "Khan", "Sarkar", "Mahmud", "Bose",
];

const DIAGNOSES: Record<string, string[]> = {
  Cardiology: ["Hypertension", "Arrhythmia", "Coronary artery disease", "Heart failure"],
  Dermatology: ["Psoriasis", "Eczema", "Acne vulgaris", "Fungal infection"],
  ENT: ["Chronic sinusitis", "Tonsillitis", "Otitis media", "Hearing loss"],
  "General Medicine": ["Type 2 diabetes", "Typhoid", "Pneumonia", "Anemia"],
  Gynecology: ["PCOS", "Prenatal care", "Endometriosis", "Fibroids"],
  Neurology: ["Migraine", "Epilepsy", "Peripheral neuropathy", "Post-stroke care"],
  Oncology: ["Breast cancer", "Lymphoma", "Lung cancer", "Colorectal cancer"],
  Orthopedics: ["ACL tear", "Fractured radius", "Lumbar disc herniation", "Osteoarthritis"],
  Pediatrics: ["Bronchiolitis", "Dengue fever", "Asthma", "Gastroenteritis"],
  Psychiatry: ["Generalized anxiety", "Major depression", "Bipolar disorder", "Insomnia"],
};

// Picked more often first: most patients are stable, few are critical.
const CONDITION_POOL: Condition[] = [
  "stable", "stable", "stable", "stable", "recovering", "recovering", "recovering",
  "observation", "observation", "discharged", "discharged", "critical",
];

const DAY_MS = 24 * 60 * 60 * 1000;

/*
 * A tiny seeded random number generator, so the demo data is the same every time
 * the server starts (Math.random would give different data on each restart).
 */
function createRandom(seed: number) {
  let state = seed;
  return function random() {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const random = createRandom(42);

function pick<T>(items: T[]) {
  return items[Math.floor(random() * items.length)];
}

function randomDigits(count: number) {
  let digits = "";
  for (let i = 0; i < count; i++) digits += Math.floor(random() * 10);
  return digits;
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function createDoctors(count: number) {
  const doctors: DoctorRecord[] = [];

  for (let i = 1; i <= count; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    // Most doctors joined 7–16 months ago; the last few are recent hires.
    let joinedDaysAgo = 200 + Math.floor(random() * 280);
    if (i > count - 4) joinedDaysAgo = 5 + Math.floor(random() * 55);
    const createdAt = daysAgo(joinedDaysAgo);

    doctors.push({
      id: `doc-${i}`,
      name: `Dr. ${firstName} ${lastName}`,
      specialization: SPECIALIZATIONS[i % SPECIALIZATIONS.length],
      hospital: pick(HOSPITALS),
      phone: `+880 17${randomDigits(8)}`,
      email: `${firstName}.${lastName}${i}@clinic.com`.toLowerCase(),
      createdAt,
    });
  }

  return doctors;
}

function createPatients(count: number, doctors: DoctorRecord[]) {
  const patients: PatientRecord[] = [];

  for (let i = 1; i <= count; i++) {
    // Raising the random number to a power favours the first doctors, so some are busier than others.
    const doctor = doctors[Math.floor(Math.pow(random(), 1.5) * doctors.length)];
    const doctorAgeInDays = Math.floor((Date.now() - new Date(doctor.createdAt).getTime()) / DAY_MS);
    // Any day since the doctor joined. More doctors join over time, so admissions still trend upward.
    const admittedDaysAgo = Math.floor(random() * doctorAgeInDays);
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const isChild = doctor.specialization === "Pediatrics";
    const admittedAt = daysAgo(admittedDaysAgo);

    patients.push({
      id: `pat-${i}`,
      name: `${firstName} ${lastName}`,
      age: isChild ? 1 + Math.floor(random() * 15) : 18 + Math.floor(random() * 65),
      gender: random() < 0.5 ? "female" : "male",
      phone: `+880 18${randomDigits(8)}`,
      email: random() < 0.7 ? `${firstName}.${lastName}${i}@mail.com`.toLowerCase() : "",
      condition: pick(CONDITION_POOL),
      diagnosis: pick(DIAGNOSES[doctor.specialization]),
      doctorId: doctor.id,
      admittedAt,
      createdAt: admittedAt,
    });
  }

  return patients;
}

export function createSeedData() {
  const doctors = createDoctors(26);
  const patients = createPatients(320, doctors);
  return { doctors, patients };
}
