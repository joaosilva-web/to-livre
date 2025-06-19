"use client";

import { Instagram, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary border-t border-primary pt-6 text-sm text-white">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-3 items-start">
        {/* Logo + Frase */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/white-logo.svg"
                width={36}
                height={36}
                alt="Logo de um calendário verde com uma asa lateral"
              />
              <p className="text-3xl font-bold">TôLivre</p>
            </Link>
          </div>
          <p className="text-white max-w-xs">
            Feito no Brasil com 🤍 para quem vive de atender.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <a href="/termos" className="hover:opacity-100 opacity-80 transition">
            Termos de uso
          </a>
          <a
            href="/privacidade"
            className="hover:opacity-100 opacity-80 transition"
          >
            Política de privacidade
          </a>
          <a
            href="/contato"
            className="hover:opacity-100 opacity-80 transition"
          >
            Contato
          </a>
        </div>

        {/* Redes sociais */}
        <div className="flex justify-center md:justify-end items-center gap-6">
          <a
            href="https://instagram.com/seuperfil"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-100 opacity-80 transition"
          >
            <Instagram />
          </a>
          <a
            href="mailto:someone@example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-100 opacity-80 transition"
          >
            <Mail />
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="flex flex-col border-t border-white/20 py-6 text-center text-xs">
        <p className="opacity-70">
          © {new Date().getFullYear()} TôLivre. Todos os direitos reservados.
        </p>
        <a
          href="https://github.com/joaosilva-web"
          target="_blank"
          className="underline cursor-pointer opacity-70 hover:opacity-100"
        >
          Desenvolvido por João Silva
        </a>
      </div>
    </footer>
  );
}
