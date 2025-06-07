"use client"; // se estiver usando App Router (Next 13+)

import { useState } from "react";
// import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import FullLogo from "./ui/FullLogo";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Como funciona", href: "#how" },
    { label: "Para quem é", href: "#who" },
    { label: "Dúvidas", href: "#faq" },
    { label: "Entrar", href: "/login" },
  ];

  return (
    <AnimatePresence>
      <motion.header
        className="w-full bg-white shadow fixed top-0 z-50"
        initial={{ y: "-100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "-100%", opacity: 1 }}
        transition={{
          duration: 0.25,
          ease: "easeIn",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <FullLogo />

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-text">
            {navItems.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="relative inline-block hover:text-primary duration-300 after:content-[''] after:block after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                {label}
              </a>
            ))}
            <Link
              href="/leads"
              className="bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-hover hover:scale-105 transition duration-300"
            >
              Comece grátis
            </Link>
          </nav>

          {/* Botão Mobile */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Abrir menu"
          >
            {isOpen ? (
              <div className="text-primary">
                <X size={28} />
              </div>
            ) : (
              <div className="text-primary">
                <Menu size={28} />
              </div>
            )}
          </button>
        </div>

        {/* Menu Mobile animado */}
        <AnimatePresence>
          {isOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="md:hidden overflow-hidden px-6 pb-4 bg-white flex flex-col gap-4 text-text"
            >
              {navItems.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="text-base hover:text-primary transition"
                >
                  {label}
                </a>
              ))}
              <Link
                href="/leads"
                onClick={() => setIsOpen(false)}
                className="bg-primary text-white px-4 py-2 rounded-xl text-center hover:bg-primary-hover transition"
              >
                Comece grátis
              </Link>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>
    </AnimatePresence>
  );
}
