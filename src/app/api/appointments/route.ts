// app/api/appointments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, AppointmentStatus } from "@/generated/prisma";
import { getUserFromCookie } from "@/app/libs/auth";
import { z } from "zod";

const prisma = new PrismaClient();

const createAppointmentSchema = z.object({
  clientName: z.string().min(1),
  service: z.string().min(1),
  price: z.number().optional(),
  date: z.string(), // ISO string
  status: z.nativeEnum(AppointmentStatus).optional(),
});

type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export async function POST(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.companyId)
    return NextResponse.json(
      { error: "Empresa não vinculada" },
      { status: 400 }
    );

  try {
    const body: unknown = await req.json();
    const data: CreateAppointmentInput = createAppointmentSchema.parse(body);
    console.log("DATA RECEBIDA: ", data);

    const appointment = await prisma.appointment.create({
      data: {
        ...data,
        date: new Date(data.date),
        professionalId: user.id,
        companyId: user.companyId,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao criar agendamento" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  console.log("URL: ", url);

  const status = url.searchParams.get("status") as
    | AppointmentStatus
    | undefined;
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  console.log("Filters - from:", from, "to:", to, "status:", status);

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId: user.id,
        ...(status && { status }),
        ...(from &&
          to && {
            date: {
              gte: new Date(from),
              lt: new Date(new Date(to).getTime() + 24 * 60 * 60 * 1000),
            },
          }),
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(appointments);
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar agendamentos" },
      { status: 500 }
    );
  }
}
