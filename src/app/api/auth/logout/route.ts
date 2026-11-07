import type { NextRequest } from "next/server";
import { deleteSession, SESSION_COOKIE } from "@/mock/auth";
import { ok } from "@/mock/http";

export async function POST(request: NextRequest) {
  deleteSession(request.cookies.get(SESSION_COOKIE)?.value);

  const response = ok({ message: "Signed out" });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
