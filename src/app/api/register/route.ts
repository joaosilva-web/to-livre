// src/app/api/auth/register/route.ts
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { verifyRecaptcha } from "@/app/libs/verifyRecaptcha";
import { checkRateLimit } from "@/app/libs/rateLimit";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password, recaptchaToken } = body as {
    name: string;
    email: string;
    password: string;
    recaptchaToken?: string;
  };

  // Rate limit by IP (best-effort using x-forwarded-for header)
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const allowed = await checkRateLimit(ip);
  if (!allowed)
    return new Response(JSON.stringify({ message: "Too many requests" }), { status: 429 });

  // If recaptcha is configured, verify token
  if (recaptchaToken) {
    const ok = await verifyRecaptcha(recaptchaToken);
    if (!ok) return new Response(JSON.stringify({ message: "reCAPTCHA failed" }), { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists)
    return new Response(JSON.stringify({ message: "E-mail já cadastrado" }), {
      status: 400,
    });

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({ data: { name, email, password: hashedPassword } });

  return new Response(
    JSON.stringify({ message: "Usuário criado com sucesso" }),
    { status: 201 }
  );
}
