import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import { PrismaClient } from '@/generated/prisma';
import { checkRateLimit } from '@/app/libs/rateLimit';

const prisma = new PrismaClient();

beforeAll(async () => {
  // ensure connection
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.rateLimit.deleteMany();
});

describe('checkRateLimit (integration)', () => {
  it('allows up to MAX_REQUESTS then blocks', async () => {
    const ip = '1.2.3.4';

    const r1 = await checkRateLimit(ip);
    expect(r1).toBe(true);

    const r2 = await checkRateLimit(ip);
    expect(r2).toBe(true);

    // third should be blocked (MAX_REQUESTS = 2 in implementation)
    const r3 = await checkRateLimit(ip);
    expect(r3).toBe(false);
  });
});
