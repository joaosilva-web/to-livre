import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { success: false, error: "id é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      where: { companyId: id },
      select: { id: true, name: true }, // só o necessário para o frontend
    });

    return NextResponse.json({ success: true, data: users });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: (err as Error).message || "Erro ao buscar profissionais",
      },
      { status: 500 }
    );
  }
}
