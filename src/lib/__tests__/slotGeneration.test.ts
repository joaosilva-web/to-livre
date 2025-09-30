import { describe, it, expect } from "vitest";
import generateSlots, { WorkingHour } from "@/lib/slotGeneration";
import { UIAppointment } from "@/lib/appointments";
import { AppointmentStatus } from "@/generated/prisma";

describe("generateSlots", () => {
  it("marks overlapping slots as unavailable (same day, simple overlap)", () => {
    // Use local date constructor so tests are deterministic across timezones
    const date = new Date(2025, 9, 1); // October 1, 2025 (monthIndex 9)
    const workingHours: WorkingHour[] = [
      { dayOfWeek: date.getDay(), openTime: "09:00", closeTime: "12:00" },
    ];

    // service duration: 60 minutes
    const duration = 60;

    // existing appointment at 10:00 local
    const apptDate = new Date(date);
    apptDate.setHours(10, 0, 0, 0);
    const appts: UIAppointment[] = [
      {
        id: "a1",
        clientName: "Test",
        service: "svc-1",
        serviceId: "svc-1",
        price: 50,
        date: apptDate.toISOString(),
        status: AppointmentStatus.PENDING,
      },
    ];

    const slots = generateSlots(date, workingHours, duration, appts);

    // slots should include 09:00, 10:00, 11:00; 10:00 should be unavailable
    const slotMap = Object.fromEntries(slots.map((s) => [s.time, s.available]));
    expect(slotMap["09:00"]).toBe(true);
    expect(slotMap["10:00"]).toBe(false);
    expect(slotMap["11:00"]).toBe(true);
  });

  it("handles appointments with timezone offsets correctly (local parsing)", () => {
    // select a local date but appointment in a timezone offset
    const date = new Date("2025-10-02T00:00:00.000Z");
    const workingHours: WorkingHour[] = [
      { dayOfWeek: date.getDay(), openTime: "08:00", closeTime: "10:00" },
    ];
    const duration = 30;

    // create appointment using local time 08:30 on the selected date
    const localAppt = new Date(date);
    localAppt.setHours(8, 30, 0, 0);
    const appts: UIAppointment[] = [
      {
        id: "a2",
        clientName: "TZ",
        service: "svc-2",
        serviceId: "svc-2",
        price: 30,
        date: localAppt.toISOString(),
        status: AppointmentStatus.PENDING,
      },
    ];

    const slots = generateSlots(date, workingHours, duration, appts);
    const slotMap = Object.fromEntries(slots.map((s) => [s.time, s.available]));

    // 08:00, 08:30 should be affected by the appointment at 06:30Z (which is 08:30 local+2),
    // but since we use ISO and Date parsing, the function should mark 08:30 as unavailable.
    expect(slotMap["08:00"]).toBe(true);
    expect(slotMap["08:30"]).toBe(false);
  });
});
