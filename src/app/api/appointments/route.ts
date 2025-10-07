import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import prisma from "@/lib/prisma";
import { buildAppointmentWhere } from "@/lib/appointmentsRange";
import * as api from "@/app/libs/apiResponse";
import { checkRateLimit } from "@/app/libs/rateLimit";

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
  // convert to signed 32-bit integers to match Postgres `int` parameters
  const a = h | 0;
  const b = ~h | 0;
  return [a, b];
}

// -------------------
// POST - criar appointment
// -------------------

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP (best-effort using x-forwarded-for header)
    const ip =
      req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const allowed = await checkRateLimit(ip);
    if (!allowed) return api.tooMany();

    const body = await req.json();
    const parsed = createAppointmentSchema.parse(body);
    const start = new Date(parsed.startTime);

    const service = await prisma.service.findUnique({
      where: { id: parsed.serviceId },
      select: { id: true, duration: true, companyId: true },
    });
    if (!service || service.companyId !== parsed.companyId)
      return api.badRequest("Serviço não encontrado ou não pertence à empresa");

    const end = new Date(start.getTime() + service.duration * 60_000);

    // Working hours
    const day = getDayOfWeekUTC(start);
    const wh = await prisma.workingHours.findFirst({
      where: { companyId: parsed.companyId, dayOfWeek: day },
    });
    if (!wh)
      return api.badRequest("Horário de funcionamento não configurado para esse dia");

    const startMinutes = start.getUTCHours() * 60 + start.getUTCMinutes();
    const endMinutes = end.getUTCHours() * 60 + end.getUTCMinutes();
    if (
      startMinutes < timeToMinutes(wh.openTime) ||
      endMinutes > timeToMinutes(wh.closeTime)
    ) {
      return api.badRequest("Agendamento fora do horário de funcionamento");
    }

    const [lock1, lock2] = hashToTwoInts(parsed.professionalId);

    const created = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lock1}::int, ${lock2}::int)`;

      const overlapCount = await tx.appointment.count({
        where: {
          professionalId: parsed.professionalId,
          AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
        },
      });

      if (overlapCount > 0) {
        // throw a specific error that we'll catch and map to 409
        const e: any = new Error(
          "Já existe agendamento conflitando para esse profissional nesse horário"
        );
        e.code = "OVERLAP";
        throw e;
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

    return api.ok(created);
  } catch (err) {
    if (err instanceof ZodError) {
      const errorDetails = err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return api.badRequest("Erro de validação", errorDetails);
    }
    const e = err as any;
    if (e?.code === "OVERLAP") {
      return api.conflict(e.message);
    }
    return api.serverError((err as Error).message || "Erro ao criar agendamento");
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

    if (!companyId) return api.badRequest("companyId é obrigatório");

    let where: Record<string, unknown>;
    if (from || to) {
      // use single source-of-truth util to build the where clause
      where = buildAppointmentWhere(companyId, from ?? "", to ?? "");
    } else {
      where = { companyId };
    }
    if (professionalId) where.professionalId = professionalId;

    const appointments = await prisma.appointment.findMany({
      where,
      include: { service: true, professional: true },
      orderBy: { startTime: "asc" },
    });

    return api.ok(appointments);
  } catch (err) {
    return api.serverError((err as Error).message || "Erro ao listar agendamentos");
  }
}

// -------------------
// PUT - atualizar appointment
// -------------------

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return api.badRequest("id é obrigatório");

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
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lock1}::int, ${lock2}::int)`;

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

export async function DELETE(req: NextRequest) {
  try {
    // This route is mounted at /api/appointments (not a dynamic [id] route),
    // so Next's generated RouteContext won't include params here. Read the id
    // from the query string or, as a fallback, from the JSON body.
    const searchId = req.nextUrl.searchParams.get("id");
    let id: string | null = searchId;

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id ?? null;
      } catch {
        // ignore JSON parse errors
        id = null;
      }
    }

    if (!id)
      return NextResponse.json<ApiResponse>(
        { success: false, error: "id é obrigatório" },
        { status: 400 }
      );

    await prisma.appointment.delete({ where: { id } });
    return api.ok({ id });
  } catch (err) {
    return api.serverError((err as Error).message || "Erro ao deletar");
  }
}
