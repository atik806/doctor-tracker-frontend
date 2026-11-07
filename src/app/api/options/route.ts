import type { NextRequest } from "next/server";
import { checkAccess } from "@/mock/auth";
import { SPECIALIZATIONS } from "@/mock/data";
import { ok } from "@/mock/http";
import { db } from "@/mock/store";

// GET /api/options: values for the filter and form dropdowns.
export async function GET(request: NextRequest) {
  const denied = checkAccess(request, "any");
  if (denied) return denied;

  const specializations = new Set(SPECIALIZATIONS);
  const hospitals = new Set<string>();
  for (const doctor of db.doctors) {
    specializations.add(doctor.specialization);
    hospitals.add(doctor.hospital);
  }

  const doctors = db.doctors
    .map((doctor) => ({ id: doctor.id, name: doctor.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return ok({
    data: {
      specializations: Array.from(specializations).sort(),
      hospitals: Array.from(hospitals).sort(),
      doctors,
    },
  });
}
