import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import * as api from "@/app/libs/apiResponse";

// DELETE /api/professional-service/[id]
export async function DELETE(req: NextRequest) {
  try {
    const pathSegments = req.nextUrl.pathname.split("/").filter(Boolean);
    const idFromPath = pathSegments[pathSegments.length - 1];
    const idFromQuery = req.nextUrl.searchParams.get("id");
    const id = idFromQuery ?? idFromPath;

    if (!id) return api.badRequest("id é obrigatório");

    await prisma.professionalService.delete({ where: { id } });

    return api.ok({});
  } catch (err) {
    const error = err as Error;
    return api.serverError(error.message || "Erro ao deletar associação");
  }
}
