// src/lib/prisma.ts
import { PrismaClient } from "@/generated/prisma";

declare global {
  // Isso diz pro TypeScript que globalThis pode ter um prisma
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") globalThis.prisma = prisma;

export default prisma;
