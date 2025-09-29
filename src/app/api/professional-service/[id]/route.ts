import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// DELETE /api/professional-service/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
