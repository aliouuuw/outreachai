import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

const PROTECTED_PATHS = ["/leads", "/dashboard", "/settings", "/saved-leads", "/billing"];
const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPath = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (!isProtectedPath && !isAuthPath) {
    return NextResponse.next();
  }

  // Check for valid session using better-auth
  let isAuthed = false;
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    isAuthed = !!session;
  } catch {
    isAuthed = false;
  }

  if (isProtectedPath && !isAuthed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
