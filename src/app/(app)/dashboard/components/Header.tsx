import DashboardLogoutButton from "../DashboardLogoutButton";

export default function Header({
  user,
}: {
  user: { name: string; email: string };
}) {
  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
      <h1 className="text-xl font-bold text-primary">Bem-vindo, {user.name}</h1>
      <DashboardLogoutButton />
    </header>
  );
}
