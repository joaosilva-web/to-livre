import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

const MAX_REQUESTS = 2;
const WINDOW_IN_HOURS = 1;

export async function checkRateLimit(ip: string): Promise<boolean> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + WINDOW_IN_HOURS * 60 * 60 * 1000);

  const existing = await prisma.rateLimit.findFirst({ where: { ip } });

  if (!existing) {
    await prisma.rateLimit.create({
      data: { ip, count: 1, expiresAt },
    });
    return true;
  }

  if (existing.expiresAt > now) {
    if (existing.count >= MAX_REQUESTS) {
      return false; // limite atingido
    }

    await prisma.rateLimit.update({
      where: { id: existing.id },
      data: { count: { increment: 1 } },
    });

    return true;
  }

  // janela expirada, resetar
  await prisma.rateLimit.update({
    where: { id: existing.id },
    data: { count: 1, expiresAt },
  });

  return true;
}
