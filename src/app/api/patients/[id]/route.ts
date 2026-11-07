import type { NextRequest } from "next/server";
import { checkAccess } from "@/mock/auth";
import { fail, notFound, ok, readJson } from "@/mock/http";
import { patientFieldsFrom, readPatientValues } from "@/mock/inputs";
import { db, findDoctorById, findPatientById, toPatient } from "@/mock/store";
import { hasErrors, validatePatient } from "@/lib/validation";

interface RouteProps {
  params: Promise<{ id: string }>;
}

// PUT /api/patients/:id (admin only)
export async function PUT(request: NextRequest, { params }: RouteProps) {
  const denied = checkAccess(request, "admin");
  if (denied) return denied;

  const { id } = await params;
  const patient = findPatientById(id);
  if (!patient) return notFound("Patient");

  const body = await readJson(request);
  if (!body) return fail(400, "Request body must be JSON");

  const values = readPatientValues(body);
  const errors = validatePatient(values);
  if (!errors.doctorId && !findDoctorById(values.doctorId)) errors.doctorId = "This doctor no longer exists";
  if (hasErrors(errors)) return fail(400, "Please fix the highlighted fields", errors);

  Object.assign(patient, patientFieldsFrom(values));
  return ok({ data: toPatient(patient) });
}

// DELETE /api/patients/:id (admin only)
export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const denied = checkAccess(request, "admin");
  if (denied) return denied;

  const { id } = await params;
  if (!findPatientById(id)) return notFound("Patient");

  db.patients = db.patients.filter((patient) => patient.id !== id);
  return ok({ data: { id } });
}
