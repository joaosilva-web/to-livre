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
  const hideFooter = pathname !== "/leads";
  const hideHeader = pathname == "/auth";

  return (
    <>
      {!hideHeader && <Header />}
      {children}
      {!hideFooter && <Footer />}
    </>
  );
}
