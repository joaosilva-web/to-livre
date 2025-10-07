import { NextRequest, NextResponse } from "next/server";
import { Service } from "@/generated/prisma";
import { z, ZodError } from "zod";

import prisma from "@/lib/prisma";
import * as api from "@/app/libs/apiResponse";

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errorDetails?: { path: string; message: string }[];
}

// Validação de Service
const serviceSchema = z.object({
  companyId: z.string(),
  name: z.string().min(1, "O nome do serviço é obrigatório"),
  price: z
    .number({ invalid_type_error: "O preço deve ser um número" })
    .nonnegative("O preço não pode ser negativo"),
  duration: z
    .number({ invalid_type_error: "A duração deve ser um número" })
    .positive("A duração deve ser maior que 0"), // em minutos
});

type ServiceInput = z.infer<typeof serviceSchema>;

// GET /api/services?companyId=...
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId");
  if (!companyId) {
    return api.badRequest("companyId é obrigatório");
  }
  console.log("companyId:", companyId);
  try {
    const services: Service[] = await prisma.service.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });

    return api.ok(services);
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Erro desconhecido";
    return api.serverError(error);
  }
}

// POST /api/services
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed: ServiceInput = serviceSchema.parse(body);

    const created: Service = await prisma.service.create({ data: parsed });
    return api.created(created);
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      const errorDetails = err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return api.badRequest("Erro de validação", errorDetails);
    }

    const error = err instanceof Error ? err.message : "Erro ao salvar serviço";
    return api.serverError(error);
  }
}
