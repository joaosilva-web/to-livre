import { NextRequest } from "next/server";

import prisma from "@/lib/prisma";
import * as api from "@/app/libs/apiResponse";

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

  if (!id) return api.badRequest("id é obrigatório");

  try {
    const users = await prisma.user.findMany({
      where: { companyId: id },
      select: { id: true, name: true }, // só o necessário para o frontend
    });

    return api.ok(users);
  } catch (err) {
    return api.serverError(
      (err as Error).message || "Erro ao buscar profissionais"
    );
  }
}
