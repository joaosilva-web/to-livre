import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { hashPassword } from "../../libs/hash";
import { registerSchema } from "../../validators/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const errorMessages = result.error.format();
      return NextResponse.json(
        { message: "Dados inválidos", errors: errorMessages },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Este e-mail já está cadastrado." },
        { status: 400 }
      );
    }

    // Hashear senha
    const hashedPassword = await hashPassword(password);

    // Cria o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: "Usuário cadastrado com sucesso",
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
