import type { NextRequest } from "next/server";
import { getSessionUser } from "@/mock/auth";
import { fail, ok } from "@/mock/http";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) return fail(401, "Your session has expired. Please sign in again.");
  return ok({ user });
}
