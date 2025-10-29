"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // show header on public pages, hide on auth and dashboard routes
  const hideHeader = pathname === "/auth" || pathname.startsWith("/dashboard");
  // show footer on most public pages; hide on dashboard and auth
  const hideFooter = pathname === "/auth" || pathname.startsWith("/dashboard");

  return (
    <>
      {!hideHeader && <Header />}
      {children}
      {!hideFooter && <Footer />}
    </>
  );
}
