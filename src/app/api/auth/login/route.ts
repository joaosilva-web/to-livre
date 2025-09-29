// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { compare } from "bcrypt";
import { signToken } from "@/app/libs/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user)
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 401 }
    );

  const isValid = await compare(password, user.password);
  if (!isValid)
    return NextResponse.json({ error: "Senha inválida" }, { status: 401 });

  const token = signToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
  });

  const res = NextResponse.json({
    message: "Login realizado com sucesso",
    token,
  });
  res.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return res;
}
