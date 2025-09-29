import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

import prisma from "@/lib/prisma";

// Validação de associação profissional-serviço
const professionalServiceSchema = z.object({
  professionalId: z.string().min(1, "O ID do profissional é obrigatório"),
  serviceId: z.string().min(1, "O ID do serviço é obrigatório"),
});

// GET /api/professional-service?companyId=...&professionalId=...
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId");
  const professionalId = req.nextUrl.searchParams.get("professionalId");

  if (!companyId && !professionalId) {
    return NextResponse.json(
      {
        success: false,
        error: "É necessário informar companyId ou professionalId",
      },
      { status: 400 }
    );
  }

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

  return NextResponse.json({ success: true, data: associations });
}

// POST /api/professional-service
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = professionalServiceSchema.parse(body);

    const created = await prisma.professionalService.create({ data: parsed });

    return NextResponse.json({ success: true, data: created });
  } catch (err) {
    if (err instanceof ZodError) {
      const errorDetails = err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { success: false, error: "Erro de validação", errorDetails },
        { status: 400 }
      );
    }

    const error = err as Error;
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao criar associação" },
      { status: 500 }
    );
  }
}
