import type { NextRequest } from "next/server";
import { checkAccess } from "@/mock/auth";
import { ok } from "@/mock/http";
import { buildStats, readRange } from "@/mock/stats";

// GET /api/stats?range=7d|30d|90d|12m|all
export async function GET(request: NextRequest) {
  const denied = checkAccess(request, "any");
  if (denied) return denied;

  const range = readRange(request.nextUrl.searchParams.get("range"));
  return ok({ data: buildStats(range) });
}
