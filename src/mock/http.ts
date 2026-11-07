import { NextResponse } from "next/server";

/* Small helpers so every mock route answers in the same JSON shape as the real API. */

export function ok(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

export function fail(status: number, message: string, errors?: Record<string, string>) {
  return NextResponse.json({ message, errors }, { status });
}

export function notFound(what: string) {
  return fail(404, `${what} not found`);
}

/** Reads the JSON body, returning null (instead of throwing) when it is missing or invalid. */
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return body;
    return null;
  } catch {
    return null;
  }
}

/** Turns any body value into a trimmed string, so validation always works with strings. */
export function text(value: unknown) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}
