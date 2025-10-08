// app/api/working-hours/[id]/route.ts
import { NextRequest } from "next/server";
import { WorkingHours } from "@/generated/prisma";
import { z, ZodError } from "zod";
import prisma from "@/lib/prisma";
import * as api from "@/app/libs/apiResponse";

// Schema para validação de atualização (parcial)
const workingHoursUpdateSchema = z.object({
  dayOfWeek: z.number().min(0).max(6).optional(),
  openTime: z
    .string()
    .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  closeTime: z
    .string()
    .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
});

type WorkingHoursUpdateInput = z.infer<typeof workingHoursUpdateSchema>;

// PUT /api/working-hours/[id]
export async function PUT(req: NextRequest) {
  try {
    const pathSegments = req.nextUrl.pathname.split("/").filter(Boolean);
    const idFromPath = pathSegments[pathSegments.length - 1];
    const idFromQuery = req.nextUrl.searchParams.get("id");
    const id = idFromQuery ?? idFromPath;

    if (!id) return api.badRequest("id é obrigatório");

    const body: unknown = await req.json();
    const parsed: WorkingHoursUpdateInput =
      workingHoursUpdateSchema.parse(body);

    if (
      parsed.openTime &&
      parsed.closeTime &&
      parsed.openTime >= parsed.closeTime
    ) {
      return api.badRequest("openTime deve ser menor que closeTime");
    }

    const updated: WorkingHours = await prisma.workingHours.update({
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
    const error = err instanceof Error ? err.message : "Erro desconhecido";
    return api.serverError(error);
  }
}

// DELETE /api/working-hours/[id]
export async function DELETE(req: NextRequest) {
  try {
    const pathSegments = req.nextUrl.pathname.split("/").filter(Boolean);
    const idFromPath = pathSegments[pathSegments.length - 1];
    const idFromQuery = req.nextUrl.searchParams.get("id");
    const id = idFromQuery ?? idFromPath;

    if (!id) return api.badRequest("id é obrigatório");

    const deleted: WorkingHours = await prisma.workingHours.delete({
      where: { id },
    });
    return api.ok(deleted);
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Erro desconhecido";
    return api.serverError(error);
  }
}
