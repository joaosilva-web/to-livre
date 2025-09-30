import { describe, it, expect } from "vitest";
import { prismaToUI, uiToPrisma } from "@/lib/appointments";
import {
  Appointment as PrismaAppointment,
  AppointmentStatus,
} from "@/generated/prisma";

describe("appointments helper", () => {
  it("prismaToUI converts prisma appointment to UIAppointment", () => {
    const prisma: PrismaAppointment = {
      id: "1",
      companyId: "cmp-1",
      professionalId: "prof-1",
      clientName: "João",
      serviceId: "svc-1",
      price: 50,
      startTime: new Date("2025-09-30T10:00:00.000Z"),
      endTime: new Date("2025-09-30T11:00:00.000Z"),
      status: AppointmentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PrismaAppointment;

    const ui = prismaToUI(prisma);
    expect(ui).not.toBeNull();
    expect(ui?.id).toBe("1");
    expect(ui?.clientName).toBe("João");
    expect(ui?.service).toBe("svc-1");
    expect(ui?.price).toBe(50);
    expect(ui?.date.startsWith("2025-09-30")).toBe(true);
  });

  it("uiToPrisma converts UI form to prisma payload", () => {
    const form: Record<string, unknown> = {
      clientName: "Maria",
      service: "svc-2",
      price: 80,
      date: "2025-10-01T09:00",
    };

    const payload = uiToPrisma(form);
    expect(payload.clientName).toBe("Maria");
    expect(payload.serviceId).toBe("svc-2");
    expect(typeof payload.startTime).toBe("string");
  });
});
