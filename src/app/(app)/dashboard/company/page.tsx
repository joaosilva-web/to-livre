// app/company/page.tsx
import { redirect } from "next/navigation";
import { getUserFromCookie } from "@/app/libs/auth";
import { PrismaClient } from "@/generated/prisma";
import CompanyForm from "./CompanyForm";
import CompanyTabs from "./CompanyTabs";

const prisma = new PrismaClient();

export default async function CompanyPage() {
  const user = await getUserFromCookie();
  if (!user) redirect("/auth");

  let company = null;
  if (user.companyId) {
    company = await prisma.company.findUnique({
      where: { id: user.companyId },
    });
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-background rounded-2xl shadow-md">
      {!company ? (
        <div className="flex flex-col justify-center items-center gap-4">
          <h2 className="text-2xl font-bold">
            Você ainda não tem uma empresa cadastrada
          </h2>
          <p className="text-text-secondary text-center">
            Crie uma empresa para começar a usar o sistema.
          </p>
          <CompanyForm user={user} />
        </div>
      ) : (
        <CompanyTabs company={company} user={user} />
      )}
    </div>
  );
}
