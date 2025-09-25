// app/api/appointments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { getUserFromCookie } from "@/app/libs/auth";
import { z } from "zod";

const prisma = new PrismaClient();

const updateAppointmentSchema = z.object({
  clientName: z.string().optional(),
  service: z.string().optional(),
  price: z.number().optional(),
  date: z.string().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"]).optional(),
});

interface AppointmentParams {
  id: string;
}

// PUT → atualizar agendamento
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(req: NextRequest, context: any) {
  const { params } = context as { params: AppointmentParams };
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = updateAppointmentSchema.parse(body);

    const appointment = await prisma.appointment.updateMany({
      where: {
        id: params.id,
        professionalId: user.id, // só pode atualizar se for o dono
      },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });

    if (appointment.count === 0) {
      return NextResponse.json(
        { error: "Agendamento não encontrado ou não autorizado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Agendamento atualizado" });
  } catch (error: any) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao atualizar agendamento" },
      { status: 500 }
    );
  }
}

// DELETE → cancelar agendamento
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(req: NextRequest, context: any) {
  const { params } = context as { params: AppointmentParams };
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const appointment = await prisma.appointment.updateMany({
      where: {
        id: params.id,
        professionalId: user.id,
      },
      data: { status: "CANCELED" },
    });

    if (appointment.count === 0) {
      return NextResponse.json(
        { error: "Agendamento não encontrado ou não autorizado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Agendamento cancelado" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao cancelar agendamento" },
      { status: 500 }
    );
  }
}
