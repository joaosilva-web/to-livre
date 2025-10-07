// src/app/api/auth/register/route.ts
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { verifyRecaptcha } from "@/app/libs/verifyRecaptcha";
import { checkRateLimit } from "@/app/libs/rateLimit";
import * as api from "@/app/libs/apiResponse";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password, recaptchaToken } = body as {
    name: string;
    email: string;
    password: string;
    recaptchaToken?: string;
  };

  // Rate limit by IP (best-effort using x-forwarded-for header)
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const allowed = await checkRateLimit(ip);
  if (!allowed) return api.tooMany();

  // If recaptcha is configured, verify token
  if (recaptchaToken) {
    const ok = await verifyRecaptcha(recaptchaToken);
      if (!ok) return api.badRequest("reCAPTCHA failed");
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return api.badRequest("E-mail já cadastrado");

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({ data: { name, email, password: hashedPassword } });

  return api.created({ message: "Usuário criado com sucesso" });
}
