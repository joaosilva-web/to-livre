import { redirect } from "next/navigation";
import { getUserFromCookie } from "@/app/libs/auth";
import DashboardContent from "./DashboardContent";

export default async function DashboardPage() {
  const user = await getUserFromCookie();
  if (!user) redirect("/auth");

  return <DashboardContent user={user} />;
}
