import type {
  Doctor,
  FilterOptions,
  Paginated,
  Patient,
  Stats,
  StatsRange,
  User,
} from "@/types";
import type { DoctorFormValues, PatientFormValues } from "./validation";

/*
 * Every call to the backend lives in this file. Components never call fetch directly.
 *
 * All URLs are relative ("/api/..."). Next.js either answers them with the mock API
 * or forwards them to the Express backend (see next.config.ts). Because the request stays
 * on the same origin, the browser sends the httpOnly session cookie automatically.
 */

export class ApiError extends Error {
  status: number;
  errors: Record<string, string>;

  constructor(status: number, message: string, errors: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

type QueryParams = Record<string, string | number | undefined>;

/** { search: "ali", page: 2, condition: "" } → "?search=ali&page=2" (empty values are skipped) */
function buildQueryString(params: QueryParams) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") searchParams.set(key, String(value));
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function sendToLogin() {
  // Clear the stale cookie first, otherwise proxy.ts would bounce us away from /login.
  await fetch("/api/auth/logout", { method: "POST" });
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  // A full page load (not router.push) on purpose: it wipes every cached query from the old session.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `/login?next=${next}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  const body = await response.json().catch(() => null);

  if (response.ok) return body as T;

  // A 5xx with no JSON body means our API never answered (e.g. the backend isn't running),
  // so the error came from the Next.js proxy itself.
  if (body === null && response.status >= 500) {
    throw new ApiError(response.status, "Can't reach the server right now. Please make sure the backend is running and try again.");
  }

  // A wrong password on the login form also returns 401, but there we want to show the error, not redirect.
  // Any other 401 (including /auth/me for a deleted account) means the session is no longer valid.
  const isLoginAttempt = path === "/auth/login";
  if (response.status === 401 && !isLoginAttempt && typeof window !== "undefined") {
    await sendToLogin();
  }

  const message = body?.message || "Something went wrong. Please try again.";
  throw new ApiError(response.status, message, body?.errors);
}

function sendJson<T>(method: "POST" | "PUT", path: string, data: unknown) {
  return request<T>(path, { method, body: JSON.stringify(data) });
}

/* ---------- Auth ---------- */

export async function login(email: string, password: string) {
  const result = await sendJson<{ user: User }>("POST", "/auth/login", { email, password });
  return result.user;
}

export async function logout() {
  await request("/auth/logout", { method: "POST" });
}

export async function getCurrentUser() {
  const result = await request<{ user: User }>("/auth/me");
  return result.user;
}

/* ---------- Doctors ---------- */

export function getDoctors(params: QueryParams) {
  return request<Paginated<Doctor>>(`/doctors${buildQueryString(params)}`);
}

export async function getDoctor(id: string) {
  const result = await request<{ data: Doctor }>(`/doctors/${id}`);
  return result.data;
}

export async function createDoctor(values: DoctorFormValues) {
  const result = await sendJson<{ data: Doctor }>("POST", "/doctors", values);
  return result.data;
}

export async function updateDoctor(id: string, values: DoctorFormValues) {
  const result = await sendJson<{ data: Doctor }>("PUT", `/doctors/${id}`, values);
  return result.data;
}

export async function deleteDoctor(id: string) {
  const result = await request<{ data: { deletedPatients: number } }>(`/doctors/${id}`, { method: "DELETE" });
  return result.data;
}

export function getDoctorPatients(doctorId: string, params: QueryParams) {
  return request<Paginated<Patient>>(`/doctors/${doctorId}/patients${buildQueryString(params)}`);
}

export async function addPatientToDoctor(doctorId: string, values: PatientFormValues) {
  const result = await sendJson<{ data: Patient }>("POST", `/doctors/${doctorId}/patients`, values);
  return result.data;
}

/* ---------- Patients ---------- */

export function getPatients(params: QueryParams) {
  return request<Paginated<Patient>>(`/patients${buildQueryString(params)}`);
}

export async function createPatient(values: PatientFormValues) {
  const result = await sendJson<{ data: Patient }>("POST", "/patients", values);
  return result.data;
}

export async function updatePatient(id: string, values: PatientFormValues) {
  const result = await sendJson<{ data: Patient }>("PUT", `/patients/${id}`, values);
  return result.data;
}

export async function deletePatient(id: string) {
  await request(`/patients/${id}`, { method: "DELETE" });
}

/* ---------- Dashboard and dropdown options ---------- */

export async function getStats(range: StatsRange) {
  const result = await request<{ data: Stats }>(`/stats?range=${range}`);
  return result.data;
}

export async function getFilterOptions() {
  const result = await request<{ data: FilterOptions }>("/options");
  return result.data;
}

/** A friendly message for toasts, whatever kind of error was thrown. */
export function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 403) return "You don't have permission to do that.";
    return error.message;
  }
  return "Something went wrong. Please check your connection and try again.";
}
