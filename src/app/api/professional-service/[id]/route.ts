import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// DELETE /api/professional-service/[id]
export async function DELETE(req: NextRequest) {
  try {
    const pathSegments = req.nextUrl.pathname.split("/").filter(Boolean);
    const idFromPath = pathSegments[pathSegments.length - 1];
    const idFromQuery = req.nextUrl.searchParams.get("id");
    const id = idFromQuery ?? idFromPath;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.professionalService.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao deletar associação" },
      { status: 500 }
    );
  }
}
