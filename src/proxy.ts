import { NextResponse, type NextRequest } from "next/server";

/*
 * Runs before every page request (Next.js 16 calls middleware "proxy").
 * This is the first, fast check: no session cookie → go to /login.
 * The API still verifies the session and role on every request.
 */

const SESSION_COOKIE = "dt_session";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isLoginPage = pathname === "/login";

  if (!hasSession && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Every page, but not API routes, Next.js internals or static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
