import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  COOKIE_MAX_AGE,
  computeAdminToken,
  isAdminAuthenticated,
} from "@/lib/admin-auth";

export async function GET() {
  const ok = await isAdminAuthenticated();
  return Response.json({ authenticated: ok });
}

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = computeAdminToken();
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return Response.json({ success: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  return Response.json({ success: true });
}
