import { NextRequest, NextResponse } from "next/server";
import { WorkingHours } from "@/generated/prisma";
import { z, ZodError } from "zod";

import prisma from "@/lib/prisma";

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
  if (!companyId) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: "companyId é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const hours: WorkingHours[] = await prisma.workingHours.findMany({
      where: { companyId },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json<ApiResponse<WorkingHours[]>>({
      success: true,
      data: hours,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error,
      },
      { status: 500 }
    );
  }
}

// POST /api/working-hours
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed: WorkingHoursInput = workingHoursSchema.parse(body);

    if (parsed.openTime >= parsed.closeTime) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "openTime deve ser menor que closeTime" },
        { status: 400 }
      );
    }

    const created: WorkingHours = await prisma.workingHours.create({
      data: parsed,
    });

    return NextResponse.json<ApiResponse<WorkingHours>>({
      success: true,
      data: created,
    });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      const errorDetails = err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      return NextResponse.json<ApiResponse>(
        { success: false, error: "Erro de validação", errorDetails },
        { status: 400 }
      );
    }

    const error = err instanceof Error ? err.message : "Erro desconhecido";

    return NextResponse.json<ApiResponse>(
      { success: false, error },
      { status: 500 }
    );
  }
}
