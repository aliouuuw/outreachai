import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/leads", "/dashboard", "/settings"];
const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

const AUTH_COOKIE_NAMES = [
  "better-auth.session_token",
  "better-auth.session-token",
  "better-auth.session",
  "session_token",
  "session-token",
  "session",
];

function hasAuthCookie(request: NextRequest) {
  return AUTH_COOKIE_NAMES.some((name) => {
    const value = request.cookies.get(name)?.value;
    return Boolean(value);
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPath = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (!isProtectedPath && !isAuthPath) {
    return NextResponse.next();
  }

  const isAuthed = hasAuthCookie(request);

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
