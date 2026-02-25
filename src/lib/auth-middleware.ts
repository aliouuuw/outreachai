import { NextRequest } from "next/server";
import { auth } from "./auth";

export async function getSessionFromRequest(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return session;
  } catch {
    return null;
  }
}

export async function requireSession(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return { session: null, userId: null };
  }
  return { session, userId: session.user.id };
}
