import { getUserFromCookie } from "@/app/libs/auth";
import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ToastProvider } from "@/app/components/ui/ToastErrorProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromCookie();
  if (!user) redirect("/auth");

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />

        <div className="flex flex-col flex-1">
          <Header user={user} />
          <main className="flex-1 p-6">{children}</main>
          <Footer />
        </div>
      </div>
    </ToastProvider>
  );
}
