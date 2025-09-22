import bcrypt from "bcrypt";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(
  name: string,
  email: string,
  password: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { name, email, password: hashedPassword },
  });
}

export async function validatePassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}
