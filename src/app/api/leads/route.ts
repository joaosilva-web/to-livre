import { z } from "zod";

import { verifyRecaptcha } from "../../libs/verifyRecaptcha";
import { checkRateLimit } from "../../libs/rateLimit";

import prisma from "@/lib/prisma";
import * as api from "@/app/libs/apiResponse";

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  interest: z.enum(["sim", "nao", "talvez"]),
});

export async function POST(req: Request) {
  const body = await req.json();
  const { recaptchaToken, ...formData } = body;

  const isHuman = await verifyRecaptcha(recaptchaToken);
  if (!isHuman) return api.forbidden("Falha na verificação do reCAPTCHA");

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!(await checkRateLimit(ip))) {
      return api.tooMany("Muitas requisições. Tente novamente em breve.");
    }

    const data = leadSchema.parse(formData); // validação

    // verifica se já existe
    const alreadyExist = await prisma.lead.findUnique({
      where: { email: data.email },
    });

    if (alreadyExist) return api.conflict("Este E-mail já foi cadastrado.");

    const lead = await prisma.lead.create({ data: { ...data, ip } });

    return api.created(lead);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return api.badRequest("Erro de validação", error.format());
    }

    return api.serverError("Erro interno ao salvar lead");
  }
}
