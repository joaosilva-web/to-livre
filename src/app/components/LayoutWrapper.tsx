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
  const hideFooter = pathname === "/leads";

  return (
    <>
      <Header />
      {children}
      {!hideFooter && <Footer />}
    </>
  );
}
