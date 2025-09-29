import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import prisma from "@/lib/prisma";

// Tipagem ApiResponse
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errorDetails?: { path?: string; message: string }[];
}

// -------------------
// Schemas de validação
// -------------------

const createAppointmentSchema = z.object({
  companyId: z.string().min(1),
  professionalId: z.string().min(1),
  clientName: z.string().min(1),
  serviceId: z.string().min(1),
  startTime: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "startTime deve ser uma ISO date válida",
  }),
});

const updateAppointmentSchema = z.object({
  startTime: z
    .string()
    .optional()
    .refine((s) => !s || !Number.isNaN(Date.parse(s)), {
      message: "startTime deve ser uma ISO date válida",
    }),
  serviceId: z.string().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"]).optional(),
});

// -------------------
// Helpers
// -------------------

function timeToMinutes(hhmm: string) {
  const [hh, mm] = hhmm.split(":").map(Number);
  return hh * 60 + mm;
}

function getDayOfWeekUTC(date: Date) {
  return date.getUTCDay(); // 0..6
}

function hashToTwoInts(key: string): [number, number] {
  let h = 5381;
  for (let i = 0; i < key.length; i++) h = (h * 33) ^ key.charCodeAt(i);
  const a = h >>> 0;
  const b = ~h >>> 0;
  return [a, b];
}

// -------------------
// POST - criar appointment
// -------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createAppointmentSchema.parse(body);
    const start = new Date(parsed.startTime);

    const service = await prisma.service.findUnique({
      where: { id: parsed.serviceId },
      select: { id: true, duration: true, companyId: true },
    });
    if (!service || service.companyId !== parsed.companyId)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Serviço não encontrado ou não pertence à empresa",
        },
        { status: 400 }
      );

    const end = new Date(start.getTime() + service.duration * 60_000);

    // Working hours
    const day = getDayOfWeekUTC(start);
    const wh = await prisma.workingHours.findFirst({
      where: { companyId: parsed.companyId, dayOfWeek: day },
    });
    if (!wh)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Horário de funcionamento não configurado para esse dia",
        },
        { status: 400 }
      );

    const startMinutes = start.getUTCHours() * 60 + start.getUTCMinutes();
    const endMinutes = end.getUTCHours() * 60 + end.getUTCMinutes();
    if (
      startMinutes < timeToMinutes(wh.openTime) ||
      endMinutes > timeToMinutes(wh.closeTime)
    ) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Agendamento fora do horário de funcionamento",
        },
        { status: 400 }
      );
    }

    const [lock1, lock2] = hashToTwoInts(parsed.professionalId);

    const created = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lock1}, ${lock2})`;

      const overlapCount = await tx.appointment.count({
        where: {
          professionalId: parsed.professionalId,
          AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
        },
      });

      if (overlapCount > 0) {
        throw new Error(
          "Já existe agendamento conflitando para esse profissional nesse horário"
        );
      }

      return await tx.appointment.create({
        data: {
          companyId: parsed.companyId,
          professionalId: parsed.professionalId,
          clientName: parsed.clientName,
          serviceId: parsed.serviceId,
          startTime: start,
          endTime: end,
        },
      });
    });

    return NextResponse.json<ApiResponse>({ success: true, data: created });
  } catch (err) {
    if (err instanceof ZodError) {
      const errorDetails = err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Erro de validação", errorDetails },
        { status: 400 }
      );
    }
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: (err as Error).message || "Erro ao criar agendamento",
      },
      { status: 500 }
    );
  }
}

// -------------------
// GET - listar appointments
// -------------------

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const companyId = searchParams.get("companyId");
    const professionalId = searchParams.get("professionalId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!companyId)
      return NextResponse.json<ApiResponse>(
        { success: false, error: "companyId é obrigatório" },
        { status: 400 }
      );

    const where: any = { companyId };
    if (professionalId) where.professionalId = professionalId;
    if (from || to) where.startTime = {};
    if (from) where.startTime.gte = new Date(from);
    if (to) where.startTime.lte = new Date(to);

    const appointments = await prisma.appointment.findMany({
      where,
      include: { service: true, professional: true },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: appointments,
    });
  } catch (err) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: (err as Error).message || "Erro ao listar agendamentos",
      },
      { status: 500 }
    );
  }
}

// -------------------
// PUT - atualizar appointment
// -------------------

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id)
      return NextResponse.json<ApiResponse>(
        { success: false, error: "id é obrigatório" },
        { status: 400 }
      );

    const parsed = updateAppointmentSchema.parse(rest);

    const current = await prisma.appointment.findUnique({ where: { id } });
    if (!current)
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Agendamento não encontrado" },
        { status: 404 }
      );

    const start = parsed.startTime
      ? new Date(parsed.startTime)
      : current.startTime;
    const serviceId = parsed.serviceId || current.serviceId;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { duration: true, companyId: true },
    });
    if (!service)
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Serviço inválido" },
        { status: 400 }
      );

    const end = new Date(start.getTime() + service.duration * 60_000);

    // same advisory lock + overlap check as POST
    const [lock1, lock2] = hashToTwoInts(current.professionalId);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lock1}, ${lock2})`;

      const overlapCount = await tx.appointment.count({
        where: {
          professionalId: current.professionalId,
          id: { not: id },
          AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
        },
      });

      if (overlapCount > 0) throw new Error("Horário em conflito");

      return await tx.appointment.update({
        where: { id },
        data: {
          startTime: start,
          endTime: end,
          serviceId,
          status: parsed.status,
        },
      });
    });

    return NextResponse.json<ApiResponse>({ success: true, data: updated });
  } catch (err) {
    if (err instanceof ZodError) {
      const errorDetails = err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Erro de validação", errorDetails },
        { status: 400 }
      );
    }
    return NextResponse.json<ApiResponse>(
      { success: false, error: (err as Error).message || "Erro ao atualizar" },
      { status: 500 }
    );
  }
}

// -------------------
// DELETE - remover appointment
// -------------------

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id)
      return NextResponse.json<ApiResponse>(
        { success: false, error: "id é obrigatório" },
        { status: 400 }
      );

    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json<ApiResponse>({ success: true, data: { id } });
  } catch (err) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: (err as Error).message || "Erro ao deletar" },
      { status: 500 }
    );
  }
}
