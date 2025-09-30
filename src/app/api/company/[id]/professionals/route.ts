import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // This route is defined under /api/company/[id]/professionals but Next's
  // generated RouteContext can be strict about handler signatures. To be
  // resilient, read the id from the URL path (last segment) or the query
  // string. If neither exists, return a 400.
  const pathSegments = req.nextUrl.pathname.split("/").filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 2];
  // in case the path is /api/company/{id}/professionals
  const idFromPath = lastSegment;
  const idFromQuery = req.nextUrl.searchParams.get("id");
  const id = idFromQuery ?? idFromPath;

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
