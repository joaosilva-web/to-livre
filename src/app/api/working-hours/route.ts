import { NextRequest, NextResponse } from "next/server";
import { WorkingHours } from "@/generated/prisma";
import { z, ZodError } from "zod";

import prisma from "@/lib/prisma";
import * as api from "@/app/libs/apiResponse";

// Tipagem de retorno padrão
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errorDetails?: { path?: string; message: string }[];
}

// Validação de WorkingHours
const workingHoursSchema = z.object({
  companyId: z.string(),
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/), // HH:mm
  closeTime: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/), // HH:mm
});

type WorkingHoursInput = z.infer<typeof workingHoursSchema>;

// GET /api/working-hours?companyId=...
export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId");
  if (!companyId) return api.badRequest("companyId é obrigatório");

  try {
    const hours: WorkingHours[] = await prisma.workingHours.findMany({
      where: { companyId },
      orderBy: { dayOfWeek: "asc" },
    });

    return api.ok(hours);
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Erro desconhecido";
    return api.serverError(error);
  }
}

// POST /api/working-hours
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed: WorkingHoursInput = workingHoursSchema.parse(body);

    if (parsed.openTime >= parsed.closeTime) {
      return api.badRequest("openTime deve ser menor que closeTime");
    }

    const created: WorkingHours = await prisma.workingHours.create({
      data: parsed,
    });

    return api.created(created);
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      const errorDetails = err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return api.badRequest("Erro de validação", errorDetails);
    }

    const error = err instanceof Error ? err.message : "Erro desconhecido";

    return api.serverError(error);
  }
}
