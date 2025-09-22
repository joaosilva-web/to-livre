// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getUserFromCookie } from "@/app/libs/auth";
import DashboardLogoutButton from "./DashboardLogoutButton";

export default async function DashboardPage() {
  const user = await getUserFromCookie(); // server-side
  if (!user) redirect("/auth"); // redireciona se não estiver logado

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-3xl font-bold text-text">Bem-vindo ao Dashboard!</h1>
      <p className="text-text-secondary mt-2">
        Aqui você verá seus agendamentos, métricas e notificações.
      </p>

      <DashboardLogoutButton />
    </div>
  );
}
