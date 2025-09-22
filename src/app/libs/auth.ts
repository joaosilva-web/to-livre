// app/libs/auth.ts
import { cookies } from "next/headers";

const EXPIRES_IN = 60 * 60 * 24; // 1 dia em segundos

export interface JWTPayload {
  id: string;
  name: string;
  email: string;
}

// Função simples de "assinatura" de token (base64)
export function signToken(payload: JWTPayload) {
  const tokenPayload = JSON.stringify({
    ...payload,
    exp: Date.now() + EXPIRES_IN * 1000,
  });
  return Buffer.from(tokenPayload).toString("base64");
}

// Função de verificação do token
export function verifyToken(token: string) {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (decoded.exp < Date.now()) return null;
    return decoded as JWTPayload;
  } catch {
    return null;
  }
}

// Pegar usuário do cookie (server)
export async function getUserFromCookie() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
