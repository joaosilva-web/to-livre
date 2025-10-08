// api/services/[id]/route.ts

import { NextRequest } from "next/server";
import { Service } from "@/generated/prisma";
import { z, ZodError } from "zod";

import prisma from "@/lib/prisma";
import * as api from "@/app/libs/apiResponse";

// Validação de Service
const serviceSchema = z.object({
  companyId: z.string(),
  name: z.string().min(1, "O nome do serviço é obrigatório"),
  price: z
    .number({ invalid_type_error: "O preço deve ser um número" })
    .nonnegative("O preço não pode ser negativo"),
  duration: z
    .number({ invalid_type_error: "A duração deve ser um número" })
    .positive("A duração deve ser maior que 0"),
});

type ServiceInput = z.infer<typeof serviceSchema>;

// PUT /api/services/:id
export async function PUT(req: NextRequest) {
  try {
    const pathSegments = req.nextUrl.pathname.split("/").filter(Boolean);
    const idFromPath = pathSegments[pathSegments.length - 1];
    const idFromQuery = req.nextUrl.searchParams.get("id");
    const id = idFromQuery ?? idFromPath;

    if (!id) return api.badRequest("id é obrigatório");

    const body: unknown = await req.json();
    const parsed: Partial<ServiceInput> = serviceSchema.partial().parse(body);

    const updated: Service = await prisma.service.update({
      where: { id },
      data: parsed,
    });

    return api.ok(updated);
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return api.badRequest(
        "Erro de validação",
        err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }))
      );
    }
    const error =
      err instanceof Error ? err.message : "Erro ao atualizar serviço";
    return api.serverError(error);
  }
}

// DELETE /api/services/:id
export async function DELETE(req: NextRequest) {
  try {
    const pathSegments = req.nextUrl.pathname.split("/").filter(Boolean);
    const idFromPath = pathSegments[pathSegments.length - 1];
    const idFromQuery = req.nextUrl.searchParams.get("id");
    const id = idFromQuery ?? idFromPath;

    if (!id) return api.badRequest("id é obrigatório");

    const deleted: Service = await prisma.service.delete({ where: { id } });
    return api.ok(deleted);
  } catch (err: unknown) {
    const error =
      err instanceof Error ? err.message : "Erro ao deletar serviço";
    return api.serverError(error);
  }
}
