// app/api/appointments/by/route.ts

import { getUserFromCookie } from "@/app/libs/auth";
import { NextRequest } from "next/server";
import { startOfDay, endOfDay } from "date-fns";

import prisma from "@/lib/prisma";
import * as api from "@/app/libs/apiResponse";

function parseLocalDate(dateStr: string): Date {
  // Trata "YYYY-MM-DD" como data no timezone local
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export async function GET(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user) return api.unauthorized();

  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  console.log("URL: ", url, "date param: ", date);

  try {
    let parsedDate: Date | null = null;

    if (date) {
      // Se for só "YYYY-MM-DD", parseia corretamente como local
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        parsedDate = parseLocalDate(date);
      } else {
        // Se vier ISO completo, usa direto
        parsedDate = new Date(date);
      }
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId: user.id,
        ...(parsedDate && {
          startTime: {
            gte: startOfDay(parsedDate),
            lte: endOfDay(parsedDate),
          },
        }),
      },
      orderBy: { startTime: "desc" },
    });
    return api.ok(appointments);
  } catch (error: unknown) {
    console.error(error);
    return api.serverError("Erro ao buscar agendamentos");
  }
}
