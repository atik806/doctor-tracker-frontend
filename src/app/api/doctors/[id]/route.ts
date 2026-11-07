import type { NextRequest } from "next/server";
import { checkAccess } from "@/mock/auth";
import { fail, notFound, ok, readJson } from "@/mock/http";
import { doctorFieldsFrom, readDoctorValues } from "@/mock/inputs";
import { countPatientsByDoctor, db, findDoctorById, isEmailTaken, toDoctor } from "@/mock/store";
import { hasErrors, validateDoctor } from "@/lib/validation";

interface RouteProps {
  params: Promise<{ id: string }>;
}

// GET /api/doctors/:id
export async function GET(request: NextRequest, { params }: RouteProps) {
  const denied = checkAccess(request, "any");
  if (denied) return denied;

  const { id } = await params;
  const doctor = findDoctorById(id);
  if (!doctor) return notFound("Doctor");

  return ok({ data: toDoctor(doctor, countPatientsByDoctor()) });
}

// PUT /api/doctors/:id (admin only)
export async function PUT(request: NextRequest, { params }: RouteProps) {
  const denied = checkAccess(request, "admin");
  if (denied) return denied;

  const { id } = await params;
  const doctor = findDoctorById(id);
  if (!doctor) return notFound("Doctor");

  const body = await readJson(request);
  if (!body) return fail(400, "Request body must be JSON");

  const values = readDoctorValues(body);
  const errors = validateDoctor(values);
  if (hasErrors(errors)) return fail(400, "Please fix the highlighted fields", errors);
  if (isEmailTaken(values.email, id)) {
    return fail(409, "A doctor with this email already exists", { email: "This email is already in use" });
  }

  Object.assign(doctor, doctorFieldsFrom(values));
  return ok({ data: toDoctor(doctor, countPatientsByDoctor()) });
}

// DELETE /api/doctors/:id (admin only). Also deletes the doctor's patients.
export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const denied = checkAccess(request, "admin");
  if (denied) return denied;

  const { id } = await params;
  if (!findDoctorById(id)) return notFound("Doctor");

  const patientsBefore = db.patients.length;
  db.patients = db.patients.filter((patient) => patient.doctorId !== id);
  db.doctors = db.doctors.filter((doctor) => doctor.id !== id);

  return ok({ data: { id, deletedPatients: patientsBefore - db.patients.length } });
}
