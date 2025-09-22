"use client";

import FullLogo from "@/app/components/ui/FullLogo";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Perfil", href: "/dashboard/profile" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="
        relative w-64 bg-white flex flex-col p-4 pt-0
        before:content-[''] before:absolute before:top-[72px] before:bottom-0
        before:right-0 before:w-px before:bg-gray-200
        before:shadow-[2px_0_4px_rgba(0,0,0,0.05)]
      "
    >
      {/* Header sem borda/sombra */}
      <div className="h-[72px] flex justify-center items-center">
        <FullLogo />
      </div>

      {/* Navegação */}
      <nav className="flex flex-col gap-2 mt-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`p-2 rounded transition-colors duration-300 hover:bg-background-muted hover:text-primary ${
              pathname === link.href
                ? "bg-background-muted font-semibold text-primary font-bold"
                : "text-text"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
