// app/api/working-hours/[id]/route.ts
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

    if (!id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "id é obrigatório" },
        { status: 400 }
      );
    }

    const body: unknown = await req.json();
    const parsed: WorkingHoursUpdateInput =
      workingHoursUpdateSchema.parse(body);

    if (
      parsed.openTime &&
      parsed.closeTime &&
      parsed.openTime >= parsed.closeTime
    ) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "openTime deve ser menor que closeTime" },
        { status: 400 }
      );
    }

    const updated: WorkingHours = await prisma.workingHours.update({
      where: { id },
      data: parsed,
    });

    return NextResponse.json<ApiResponse<WorkingHours>>({
      success: true,
      data: updated,
    });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Erro de validação",
          errorDetails: err.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
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

// DELETE /api/working-hours/[id]
export async function DELETE(req: NextRequest) {
  try {
    const pathSegments = req.nextUrl.pathname.split("/").filter(Boolean);
    const idFromPath = pathSegments[pathSegments.length - 1];
    const idFromQuery = req.nextUrl.searchParams.get("id");
    const id = idFromQuery ?? idFromPath;

    if (!id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "id é obrigatório" },
        { status: 400 }
      );
    }

    const deleted: WorkingHours = await prisma.workingHours.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse<WorkingHours>>({
      success: true,
      data: deleted,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Erro desconhecido";

    return NextResponse.json<ApiResponse>(
      { success: false, error },
      { status: 500 }
    );
  }
}
