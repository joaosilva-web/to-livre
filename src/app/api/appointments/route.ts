import { NextRequest } from "next/server";
import { z, ZodError } from "zod";
import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import { buildAppointmentWhere } from "@/lib/appointmentsRange";
import * as api from "@/app/libs/apiResponse";
import { checkRateLimit } from "@/app/libs/rateLimit";
import { getUserFromCookie } from "@/app/libs/auth";

// local helper error type for errors with codes (e.g. OVERLAP)
type ErrorWithCode = Error & { code?: string };

// Schemas
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

function timeToMinutes(hhmm: string) {
  const [hh, mm] = hhmm.split(":").map(Number);
  return hh * 60 + mm;
}

function getDayOfWeekUTC(date: Date) {
  return date.getUTCDay();
}

function hashToTwoInts(key: string): [number, number] {
  let h = 5381;
  for (let i = 0; i < key.length; i++) h = (h * 33) ^ key.charCodeAt(i);
  const a = h | 0;
  const b = ~h | 0;
  return [a, b];
}

// POST - criar appointment
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // If the request comes from an authenticated user, skip rate limiting
    const user = await getUserFromCookie();
    const allowed = await checkRateLimit(ip, { userId: user?.id ?? null });
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
      return api.badRequest(
        "Horário de funcionamento não configurado para esse dia"
      );

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
        const e = new Error(
          "Já existe agendamento conflitando para esse profissional nesse horário"
        ) as ErrorWithCode;
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
    const e = err as ErrorWithCode;
    if (e?.code === "OVERLAP") return api.conflict(e.message);
    return api.serverError(
      (err as Error).message || "Erro ao criar agendamento"
    );
  }
}

// GET - listar appointments
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const companyId = searchParams.get("companyId");
    const professionalId = searchParams.get("professionalId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!companyId) return api.badRequest("companyId é obrigatório");

    let where: Prisma.AppointmentWhereInput;
    if (from || to) {
      // buildAppointmentWhere returns a plain object but it matches AppointmentWhereInput shape
      where = buildAppointmentWhere(companyId, from ?? "", to ?? "");
    } else {
      where = { companyId };
    }
    if (professionalId) where = { ...where, professionalId };

    const appointments = await prisma.appointment.findMany({
      where,
      include: { service: true, professional: true },
      orderBy: { startTime: "asc" },
    });

    return api.ok(appointments);
  } catch (err) {
    return api.serverError(
      (err as Error).message || "Erro ao listar agendamentos"
    );
  }
}

// PUT - atualizar appointment
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return api.badRequest("id é obrigatório");

    const parsed = updateAppointmentSchema.parse(rest);

    const current = await prisma.appointment.findUnique({ where: { id } });
    if (!current) return api.notFound("Agendamento não encontrado");

    const start = parsed.startTime
      ? new Date(parsed.startTime)
      : current.startTime;
    const serviceId = parsed.serviceId || current.serviceId;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { duration: true, companyId: true },
    });
    if (!service) return api.badRequest("Serviço inválido");

    const end = new Date(start.getTime() + service.duration * 60_000);

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

    return api.ok(updated);
  } catch (err) {
    if (err instanceof ZodError) {
      const errorDetails = err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return api.badRequest("Erro de validação", errorDetails);
    }
    return api.serverError((err as Error).message || "Erro ao atualizar");
  }
}

// DELETE - remover appointment
export async function DELETE(req: NextRequest) {
  try {
    const searchId = req.nextUrl.searchParams.get("id");
    let id: string | null = searchId;

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id ?? null;
      } catch {
        id = null;
      }
    }

    if (!id) return api.badRequest("id é obrigatório");

    await prisma.appointment.delete({ where: { id } });
    return api.ok({ id });
  } catch (err) {
    return api.serverError((err as Error).message || "Erro ao deletar");
  }
}
