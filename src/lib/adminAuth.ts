import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";

const sha = (value: string) => createHash("sha256").update(value).digest();

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

export function passwordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeEqual(sha(input), sha(expected));
}

/** Cookie value derived from the password, so changing the password logs everyone out. */
export function sessionValue() {
  const pw = process.env.ADMIN_PASSWORD;
  return pw ? createHmac("sha256", pw).update("wedding-admin-session").digest("hex") : null;
}

export async function isAdmin() {
  const expected = sessionValue();
  if (!expected) return false;
  const actual = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(actual) && timingSafeEqual(sha(actual!), sha(expected));
}
