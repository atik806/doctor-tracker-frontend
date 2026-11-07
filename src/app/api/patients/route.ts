import type { NextRequest } from "next/server";
import { checkAccess } from "@/mock/auth";
import { fail, ok, readJson } from "@/mock/http";
import { patientFieldsFrom, readPatientValues } from "@/mock/inputs";
import { db, findDoctorById, findPatients, newId, toPatient } from "@/mock/store";
import { hasErrors, validatePatient } from "@/lib/validation";

// GET /api/patients?search&condition&doctorId&gender&from&to&sort&page&limit
export async function GET(request: NextRequest) {
  const denied = checkAccess(request, "any");
  if (denied) return denied;

  return ok(findPatients(request.nextUrl.searchParams));
}

// POST /api/patients (admin only)
export async function POST(request: NextRequest) {
  const denied = checkAccess(request, "admin");
  if (denied) return denied;

  const body = await readJson(request);
  if (!body) return fail(400, "Request body must be JSON");

  const values = readPatientValues(body);
  const errors = validatePatient(values);
  if (!errors.doctorId && !findDoctorById(values.doctorId)) errors.doctorId = "This doctor no longer exists";
  if (hasErrors(errors)) return fail(400, "Please fix the highlighted fields", errors);

  const record = { id: newId("pat"), ...patientFieldsFrom(values), createdAt: new Date().toISOString() };
  db.patients.push(record);
  return ok({ data: toPatient(record) }, 201);
}
