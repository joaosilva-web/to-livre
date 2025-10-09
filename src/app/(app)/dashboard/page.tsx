import { redirect } from "next/navigation";
import { getUserFromCookie } from "@/app/libs/auth";
import DashboardContent from "./DashboardContent";

export default async function DashboardPage() {
  const user = await getUserFromCookie();
  if (!user) redirect("/auth");

  // Se o usuário não tiver uma empresa vinculada
  if (!user.companyId) {
    console.log(user);
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-8 bg-background text-center">
        <h1 className="text-2xl font-bold mb-4 text-text">
          Você ainda não tem uma empresa configurada
        </h1>
        <p className="text-text-secondary mb-6">
          Para acessar o dashboard, é necessário criar sua empresa.
        </p>
        <a
          href="/company"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition"
        >
          Criar Empresa
        </a>
      </div>
    );
  }

  // Caso tenha empresa, renderiza o dashboard
  return <DashboardContent />;
}
