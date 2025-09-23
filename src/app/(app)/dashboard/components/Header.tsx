import { capitalize } from "@/app/helpers/capitalize";
import DashboardLogoutButton from "../DashboardLogoutButton";

export default function Header({
  user,
}: {
  user: { name: string; email: string };
}) {
  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
      <h1 className="text-2xl font-bold text-text-secondary">
        Bem-vindo, {capitalize(user.name, true)}
      </h1>
      <DashboardLogoutButton />
    </header>
  );
}
