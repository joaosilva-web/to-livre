import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { spawn, execSync } from "child_process";
let prisma: unknown = null;
let serverProcess: ReturnType<typeof spawn> | null = null;
const TEST_DB =
  "postgresql://test:test@127.0.0.1:5433/to_livre_test?schema=public";
// allow any here for test fixtures
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let createdCompany: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let createdProfessional: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let createdService: any = null;

function waitForUrl(url: string, timeout = 30_000) {
  const start = Date.now();
  return new Promise<void>(async (resolve, reject) => {
    while (Date.now() - start < timeout) {
      try {
        const res = await fetch(url, { method: "GET" as const });
        if (res.status < 500) return resolve();
      } catch {
        // ignore
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    reject(new Error("timeout waiting for " + url));
  });
}

beforeAll(async () => {
  // Ensure test DB is up and migrations applied using existing npm scripts
  const runCmd = (cmd: string) => {
    // execSync overload types conflict in this test env; ignore for these calls
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    execSync(cmd, { stdio: "inherit", shell: true });
  };

  // Build app (production) before connecting Prisma to avoid file-lock issues on Windows
  // connect Prisma client
  await prisma.$connect();
  // Start Next in dev mode (avoids running build/prisma generate during the test)
  serverProcess = spawn("npm", ["run", "dev"], {
    env: { ...process.env, DATABASE_URL: TEST_DB },
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  // instantiate Prisma Client after build to avoid query engine lock issues on Windows
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  prisma = new (require("@/generated/prisma").PrismaClient)();
  await (prisma as any).$connect();

  // Clean minimal tables
  await (prisma as any).appointment.deleteMany();
  await (prisma as any).professionalService.deleteMany();
  await (prisma as any).workingHours.deleteMany();
  await (prisma as any).service.deleteMany();
  await (prisma as any).user.deleteMany();
  await (prisma as any).company.deleteMany();

  // Create fixtures
  createdCompany = await (prisma as any).company.create({
    data: { nomeFantasia: "E2E Co", cnpjCpf: `cnpj-${Date.now()}` },
  });
  createdProfessional = await (prisma as any).user.create({
    data: {
      name: "E2E Prof",
      email: `prof-${Date.now()}@example.com`,
      password: "x",
      companyId: createdCompany.id,
    },
  });
  createdService = await (prisma as any).service.create({
    data: {
      companyId: createdCompany.id,
      name: "E2E Service",
      price: 10,
      duration: 60,
    },
  });
  const start = new Date(Date.UTC(2026, 0, 6, 10, 0, 0));
  const day = start.getUTCDay();
  await (prisma as any).workingHours.create({
    data: {
      companyId: createdCompany.id,
      dayOfWeek: day,
      openTime: "00:00",
      closeTime: "23:59",
    },
  });

  serverProcess = spawn("npm", ["run", "start"], {
    env: { ...process.env, DATABASE_URL: TEST_DB },
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  serverProcess.stdout?.on("data", (d) => process.stdout.write(`[next] ${d}`));
  serverProcess.stderr?.on("data", (d) => process.stderr.write(`[next] ${d}`));

  // wait for server to be ready
  await waitForUrl("http://127.0.0.1:3000/");
});

afterAll(async () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  await (prisma as any).$disconnect();
  // optional: leave DB running for debugging; do not tear down here
});

describe("E2E /api/appointments concurrency", () => {
  it("only one concurrent POST succeeds and the other conflicts", async () => {
    // use fixtures created in beforeAll (we can read the single row for each table)
    const service =
      createdService ?? (await (prisma as any).service.findFirstOrThrow());
    const professional =
      createdProfessional ?? (await (prisma as any).user.findFirstOrThrow());
    const company =
      createdCompany ?? (await (prisma as any).company.findFirstOrThrow());

    const start = new Date(Date.UTC(2026, 0, 6, 10, 0, 0)).toISOString();

    const body = JSON.stringify({
      companyId: company.id,
      professionalId: professional.id,
      clientName: "E2E Client",
      serviceId: service.id,
      startTime: start,
    });

    const url = "http://127.0.0.1:3000/api/appointments";

    const [r1, r2] = await Promise.allSettled([
      fetch(url, {
        method: "POST",
        body,
        headers: { "content-type": "application/json" },
      }),
      fetch(url, {
        method: "POST",
        body,
        headers: { "content-type": "application/json" },
      }),
    ]);

    const okCount = [r1, r2].filter(
      (r): r is PromiseFulfilledResult<Response> =>
        r.status === "fulfilled" &&
        (r as PromiseFulfilledResult<Response>).value.status === 200
    ).length;
    const conflictCount = [r1, r2].filter(
      (r): r is PromiseFulfilledResult<Response> =>
        r.status === "fulfilled" &&
        (r as PromiseFulfilledResult<Response>).value.status === 409
    ).length;

    expect(okCount).toBe(1);
    expect(conflictCount).toBe(1);
  }, 30_000);
});
