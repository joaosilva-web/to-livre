// app/api/company/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Company } from "@/generated/prisma";
import { getUserFromCookie, JWTPayload } from "@/app/libs/auth";
import { z, ZodError } from "zod";

import prisma from "@/lib/prisma";

// Schema para validar dados da empresa
const companySchema = z.object({
  nomeFantasia: z.string().min(1, "Nome fantasia é obrigatório"),
  razaoSocial: z.string().optional(),
  cnpjCpf: z.string().min(11, "CNPJ ou CPF inválido"),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional(),
});

// Tipagem do body validado
type CompanyInput = z.infer<typeof companySchema>;

export async function POST(req: NextRequest) {
  const user: JWTPayload | null = await getUserFromCookie();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body: unknown = await req.json();
    const data: CompanyInput = companySchema.parse(body); // valida o body

    const company: Company = await prisma.company.create({
      data: {
        ...data,
        users: { connect: { id: user.id } },
      },
    });

    // Vincula o usuário à empresa
    await prisma.user.update({
      where: { id: user.id },
      data: { companyId: company.id },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error(error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao criar empresa" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const user: JWTPayload | null = await getUserFromCookie();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.companyId)
    return NextResponse.json(
      { error: "Empresa não encontrada" },
      { status: 404 }
    );

  try {
    const body: unknown = await req.json();
    const data: CompanyInput = companySchema.parse(body); // valida o body

    const company: Company = await prisma.company.update({
      where: { id: user.companyId },
      data,
    });

    return NextResponse.json(company, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao atualizar empresa" },
      { status: 500 }
    );
  }
}
