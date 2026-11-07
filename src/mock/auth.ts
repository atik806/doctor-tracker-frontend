import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import type { Role, User } from "@/types";

export const SESSION_COOKIE = "dt_session";
const SESSION_HOURS = 8;

interface DemoAccount extends User {
  password: string;
}

/*
 * Demo accounts for the mock API. The real backend stores bcrypt password hashes
 * in MongoDB and never keeps plain-text passwords.
 */
const ACCOUNTS: DemoAccount[] = [
  {
    id: "user-1",
    name: "Sarah Rahman",
    email: "admin@doctortracker.com",
    password: "Admin@123",
    role: "admin",
  },
  {
    id: "user-2",
    name: "Karim Hossain",
    email: "staff@doctortracker.com",
    password: "Staff@123",
    role: "staff",
  },
];

interface Session {
  userId: string;
  expiresAt: number;
}

// Kept on globalThis so sessions survive hot reloads in development.
const globalSessions = globalThis as unknown as { doctorTrackerSessions?: Map<string, Session> };
if (!globalSessions.doctorTrackerSessions) globalSessions.doctorTrackerSessions = new Map();
const sessions = globalSessions.doctorTrackerSessions;

function publicUser(account: DemoAccount): User {
  return { id: account.id, name: account.name, email: account.email, role: account.role };
}

export function checkCredentials(email: string, password: string) {
  const account = ACCOUNTS.find((item) => item.email === email.trim().toLowerCase());
  if (!account || account.password !== password) return null;
  return publicUser(account);
}

export function createSession(user: User) {
  const token = randomUUID();
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + SESSION_HOURS * 60 * 60 * 1000 });
  return token;
}

export function deleteSession(token: string | undefined) {
  if (token) sessions.delete(token);
}

export function getSessionUser(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  const account = ACCOUNTS.find((item) => item.id === session.userId);
  return account ? publicUser(account) : null;
}

export const sessionCookieOptions = {
  httpOnly: true, // JavaScript in the browser can't read it
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_HOURS * 60 * 60,
};

/**
 * Checks the session (authentication) and the role (authorization).
 * Returns an error response to send back, or null when the request may continue.
 */
export function checkAccess(request: NextRequest, requiredRole: Role | "any") {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ message: "Your session has expired. Please sign in again." }, { status: 401 });
  }
  if (requiredRole === "admin" && user.role !== "admin") {
    return NextResponse.json({ message: "You don't have permission to make changes." }, { status: 403 });
  }
  return null;
}
