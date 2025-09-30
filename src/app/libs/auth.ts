// app/libs/auth.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const EXPIRES_IN = "1d"; // 1 dia

export type Role = "OWNER" | "MANAGER" | "EMPLOYEE";

export interface JWTPayload {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId?: string | null;
}

if (!process.env.JWT_SECRET) {
  console.warn(
    "JWT_SECRET is not set. Set it in your environment for secure tokens."
  );
}

export function signToken(payload: JWTPayload) {
  // If JWT_SECRET is missing, jwt.sign will still create a token when given an empty string,
  // but this is insecure. We deliberately allow it so dev environments without env var keep working,
  // while warning above notifies the developer.
  const secret = process.env.JWT_SECRET || "";
  return jwt.sign(payload as object, secret, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET || "";
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function getUserFromCookie(): Promise<JWTPayload | null> {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;
  if (!token) return null;

  const user = verifyToken(token);
  if (!user) return null;

  return user;
}
