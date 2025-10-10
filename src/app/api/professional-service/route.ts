import { NextRequest } from "next/server";
import { z, ZodError } from "zod";

import prisma from "@/lib/prisma";
import * as api from "@/app/libs/apiResponse";
import { getUserFromCookie } from "@/app/libs/auth";

// Validação de associação profissional-serviço
const professionalServiceSchema = z.object({
  professionalId: z.string().min(1, "O ID do profissional é obrigatório"),
  serviceId: z.string().min(1, "O ID do serviço é obrigatório"),
});

// GET /api/professional-service?companyId=...&professionalId=...
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId");
  const professionalId = req.nextUrl.searchParams.get("professionalId");

  if (!companyId && !professionalId)
    return api.badRequest("É necessário informar companyId ou professionalId");

  let associations;

  if (professionalId) {
    // Buscar apenas os serviços de um profissional
    associations = await prisma.professionalService.findMany({
      where: { professionalId },
      include: {
        service: true,
        professional: true,
      },
    });
  } else if (companyId) {
    // Buscar todos os professionalServices de uma empresa
    associations = await prisma.professionalService.findMany({
      where: {
        service: {
          companyId,
        },
      },
      include: {
        service: true,
        professional: true,
      },
    });
  }

  return api.ok(associations);
}

// POST /api/professional-service
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = professionalServiceSchema.parse(body);

    const user = await getUserFromCookie();
    if (!user) return api.unauthorized();

    // Ensure service belongs to user's company
    const service = await prisma.service.findUnique({ where: { id: parsed.serviceId } });
    if (!service) return api.notFound("Serviço não encontrado");
    if (user.companyId && service.companyId !== user.companyId)
      return api.forbidden("Você não pode associar serviços de outra empresa");

    const created = await prisma.professionalService.create({ data: parsed });

    return api.created(created);
  } catch (err) {
    if (err instanceof ZodError) {
      const errorDetails = err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return api.badRequest("Erro de validação", errorDetails);
    }
    const error = err as Error;
    return api.serverError(error.message || "Erro ao criar associação");
  }
}
