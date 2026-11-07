import type { NextRequest } from "next/server";
import { checkCredentials, createSession, SESSION_COOKIE, sessionCookieOptions } from "@/mock/auth";
import { fail, ok, readJson, text } from "@/mock/http";
import { isValidEmail } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await readJson(request);
  const email = text(body?.email);
  const password = text(body?.password);

  const errors: Record<string, string> = {};
  if (!isValidEmail(email)) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Enter your password";
  if (Object.keys(errors).length > 0) return fail(400, "Please fix the highlighted fields", errors);

  const user = checkCredentials(email, password);
  if (!user) return fail(401, "Incorrect email or password");

  const response = ok({ user });
  response.cookies.set(SESSION_COOKIE, createSession(user), sessionCookieOptions);
  return response;
}
