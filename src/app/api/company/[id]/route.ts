// app/api/company/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Company } from "@/generated/prisma";
import { getUserFromCookie, JWTPayload } from "@/app/libs/auth";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user: JWTPayload | null = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  // Só permite pegar empresa se for a mesma vinculada ao usuário
  if (user.companyId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const company: Company | null = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(company, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar empresa" },
      { status: 500 }
    );
  }
}
