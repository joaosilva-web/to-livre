import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

function hashToTwoInts(key: string): [number, number] {
  let h = 5381;
  for (let i = 0; i < key.length; i++) h = (h * 33) ^ key.charCodeAt(i);
  const a = h | 0;
  const b = ~h | 0;
  return [a, b];
}

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // clean appointments and related minimal data
  await prisma.appointment.deleteMany();
  // delete dependent ProfessionalService records first to avoid FK constraint
  await prisma.professionalService.deleteMany();
  await prisma.workingHours.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
});

describe("appointments concurrency (advisory lock)", () => {
  it("serializes concurrent create attempts so only one succeeds", async () => {
    // create minimal data: company, professional, service, working hours
    const company = await prisma.company.create({
      data: { nomeFantasia: "ACME", cnpjCpf: `cnpj-${Date.now()}` },
    });

    const professional = await prisma.user.create({
      data: {
        name: "Prof",
        email: `prof-${Date.now()}@example.com`,
        password: "x",
        companyId: company.id,
      },
    });

    const service = await prisma.service.create({
      data: {
        companyId: company.id,
        name: "Consult",
        price: 100,
        duration: 60,
      },
    });

    // pick a UTC date with a weekday that we'll create working hours for
    const start = new Date(Date.UTC(2026, 0, 6, 10, 0, 0)); // Tue
    const day = start.getUTCDay();
    await prisma.workingHours.create({
      data: {
        companyId: company.id,
        dayOfWeek: day,
        openTime: "00:00",
        closeTime: "23:59",
      },
    });

    const [lock1, lock2] = hashToTwoInts(professional.id);

    const attempt = async () =>
      prisma.$transaction(async (tx) => {
        // acquire advisory lock (blocks until available)
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lock1}::int, ${lock2}::int)`;

        // check overlap
        const startTime = start;
        const endTime = new Date(start.getTime() + service.duration * 60_000);

        const overlapCount = await tx.appointment.count({
          where: {
            professionalId: professional.id,
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gt: startTime } },
            ],
          },
        });

        if (overlapCount > 0) {
          const e = new Error("OVERLAP") as Error & { code?: string };
          e.code = "OVERLAP";
          throw e;
        }

        return tx.appointment.create({
          data: {
            companyId: company.id,
            professionalId: professional.id,
            clientName: "Client",
            serviceId: service.id,
            startTime,
            endTime,
          },
        });
      });

    // run two attempts in parallel
    const results = await Promise.allSettled([attempt(), attempt()]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    const reason = (rejected[0] as PromiseRejectedResult).reason as Error;
    // the code we throw sets message 'OVERLAP' — assert that
    expect(reason.message).toMatch(/OVERLAP|confli/i);
  });
});
