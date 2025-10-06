import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

async function main() {
  const prisma = new PrismaClient();
  try {
    const baseUrl =
      process.argv[2] || process.env.BASE_URL || "http://localhost:3001";
    const companyId = process.argv[3] || process.env.COMPANY_ID;
    if (!companyId) {
      console.error(
        "Usage: node scripts/integration_appointments_test.js <baseUrl?> <companyId>"
      );
      process.exit(2);
    }

    // Find any existing service and professional for the company
    const service = await prisma.service.findFirst({ where: { companyId } });
    const professional = await prisma.professional.findFirst({
      where: { companyId },
    });
    if (!service || !professional) {
      console.error(
        "Could not find service or professional for company:",
        companyId
      );
      process.exit(3);
    }

    // create an appointment for today (UTC) at 10:00
    const today = new Date();
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth();
    const date = today.getUTCDate();
    const start = new Date(Date.UTC(year, month, date, 10, 0, 0));
    const end = new Date(start.getTime() + service.duration * 60_000);

    const appt = await prisma.appointment.create({
      data: {
        companyId,
        professionalId: professional.id,
        clientName: "Integration Test",
        serviceId: service.id,
        startTime: start,
        endTime: end,
      },
    });

    console.log(
      "Seeded appointment id=",
      appt.id,
      "start=",
      appt.startTime.toISOString()
    );

    // call the API for today's date
    const pad = (n) => String(n).padStart(2, "0");
    const isoDate = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(
      start.getDate()
    )}`;
    const url = `${baseUrl}/api/appointments?companyId=${encodeURIComponent(
      companyId
    )}&from=${isoDate}&to=${isoDate}`;
    console.log("Querying", url);

    const res = await fetch(url);
    const body = await res.json();
    console.log("API response status", res.status);

    if (!body || !body.success) {
      console.error("API responded with error or no data", body);
      throw new Error("API error");
    }

    const found = (body.data || []).find((a) => a.id === appt.id);
    if (found) {
      console.log("Integration test passed: appointment found in API response");
    } else {
      console.error(
        "Integration test failed: seeded appointment not found in API response"
      );
      console.error(
        "API returned",
        (body.data || []).map((a) => a.id)
      );
      process.exit(4);
    }

    // cleanup
    await prisma.appointment.delete({ where: { id: appt.id } });
    console.log("Cleaned up seeded appointment");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(10);
  } finally {
    await prisma.$disconnect();
  }
}

main();
