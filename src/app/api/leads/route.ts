import { z } from "zod";
import { PrismaClient } from "@/generated/prisma";
import { NextResponse } from "next/server";

import { verifyRecaptcha } from "../../libs/verifyRecaptcha";
import { checkRateLimit } from "../../libs/rateLimit";

const prisma = new PrismaClient();

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  interest: z.enum(["sim", "nao", "talvez"]),
});

export async function POST(req: Request) {
  const body = await req.json();
  const { recaptchaToken, ...formData } = body;

  const isHuman = await verifyRecaptcha(recaptchaToken);
  if (!isHuman) {
    return NextResponse.json(
      { error: "Falha na verificação do reCAPTCHA" },
      { status: 403 }
    );
  }

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!(await checkRateLimit(ip))) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em breve." },
        { status: 429 }
      );
    }

    const data = leadSchema.parse(formData); // validação

    // verifica se já existe
    const alreadyExist = await prisma.lead.findUnique({
      where: { email: data.email },
    });

    if (alreadyExist) {
      return NextResponse.json(
        { error: "Este E-mail já foi cadastrado." },
        { status: 409 }
      );
    }

    const lead = await prisma.lead.create({ data: { ...data, ip } });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Erro de validação", issues: error.format() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno ao salvar lead" },
      { status: 500 }
    );
  }
}
