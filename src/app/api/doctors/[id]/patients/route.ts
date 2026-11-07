import type { NextRequest } from "next/server";
import { checkAccess } from "@/mock/auth";
import { fail, notFound, ok, readJson } from "@/mock/http";
import { patientFieldsFrom, readPatientValues } from "@/mock/inputs";
import { db, findDoctorById, findPatients, newId, toPatient } from "@/mock/store";
import { hasErrors, validatePatient } from "@/lib/validation";

interface RouteProps {
  params: Promise<{ id: string }>;
}

// GET /api/doctors/:id/patients?search&page&limit
export async function GET(request: NextRequest, { params }: RouteProps) {
  const denied = checkAccess(request, "any");
  if (denied) return denied;

  const { id } = await params;
  if (!findDoctorById(id)) return notFound("Doctor");

  return ok(findPatients(request.nextUrl.searchParams, id));
}

// POST /api/doctors/:id/patients (admin only). Creates a patient under this doctor.
export async function POST(request: NextRequest, { params }: RouteProps) {
  const denied = checkAccess(request, "admin");
  if (denied) return denied;

  const { id } = await params;
  if (!findDoctorById(id)) return notFound("Doctor");

  const body = await readJson(request);
  if (!body) return fail(400, "Request body must be JSON");

  // The doctor comes from the URL, not from the body.
  const values = { ...readPatientValues(body), doctorId: id };
  const errors = validatePatient(values);
  if (hasErrors(errors)) return fail(400, "Please fix the highlighted fields", errors);

  const record = { id: newId("pat"), ...patientFieldsFrom(values), createdAt: new Date().toISOString() };
  db.patients.push(record);
  return ok({ data: toPatient(record) }, 201);
}
