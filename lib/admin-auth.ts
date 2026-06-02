import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "cp_admin";
export const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export function computeAdminToken(): string {
  const secret = process.env.ADMIN_PASSWORD ?? "";
  return createHmac("sha256", secret).update("carposter_admin_v1").digest("hex");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const expected = computeAdminToken();
  try {
    return timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export async function requireAdminAuth(): Promise<Response | null> {
  const ok = await isAdminAuthenticated();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}
