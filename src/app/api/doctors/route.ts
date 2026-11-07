import type { NextRequest } from "next/server";
import { checkAccess } from "@/mock/auth";
import { fail, ok, readJson } from "@/mock/http";
import { doctorFieldsFrom, readDoctorValues } from "@/mock/inputs";
import { countPatientsByDoctor, db, findDoctors, isEmailTaken, newId, toDoctor } from "@/mock/store";
import { hasErrors, validateDoctor } from "@/lib/validation";

// GET /api/doctors?search&specialization&hospital&from&to&sort&page&limit
export async function GET(request: NextRequest) {
  const denied = checkAccess(request, "any");
  if (denied) return denied;

  return ok(findDoctors(request.nextUrl.searchParams));
}

// POST /api/doctors (admin only)
export async function POST(request: NextRequest) {
  const denied = checkAccess(request, "admin");
  if (denied) return denied;

  const body = await readJson(request);
  if (!body) return fail(400, "Request body must be JSON");

  const values = readDoctorValues(body);
  const errors = validateDoctor(values);
  if (hasErrors(errors)) return fail(400, "Please fix the highlighted fields", errors);
  if (isEmailTaken(values.email)) {
    return fail(409, "A doctor with this email already exists", { email: "This email is already in use" });
  }

  const record = { id: newId("doc"), ...doctorFieldsFrom(values), createdAt: new Date().toISOString() };
  db.doctors.push(record);
  return ok({ data: toDoctor(record, countPatientsByDoctor()) }, 201);
}
