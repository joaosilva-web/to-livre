// app/company/CompanyTabs.tsx
"use client";

import { useState } from "react";
import CompanyForm from "./CompanyForm";
import { JWTPayload } from "@/app/libs/auth";

interface CompanyTabsProps {
  company: {
    id: string;
    nomeFantasia: string;
    razaoSocial?: string | null;
    cnpjCpf: string;
    endereco?: string | null;
    telefone?: string | null;
    email?: string | null;
    contrato: string;
  };
  user: JWTPayload;
}

export default function CompanyTabs({ company, user }: CompanyTabsProps) {
  const [tab, setTab] = useState<"info" | "edit">("info");

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Subnavegação lateral */}
      <nav className="md:w-1/4 bg-white rounded-lg shadow p-4 flex flex-col gap-2">
        <button
          className={`p-2 rounded transition-colors duration-300 hover:bg-background-muted hover:text-primary ${
            tab === "info"
              ? "bg-background-muted font-semibold text-primary font-bold"
              : "text-text"
          }`}
          onClick={() => setTab("info")}
        >
          Informações
        </button>
        <button
          className={`p-2 rounded transition-colors duration-300 hover:bg-background-muted hover:text-primary ${
            tab === "edit"
              ? "bg-background-muted font-semibold text-primary font-bold"
              : "text-text"
          }`}
          onClick={() => setTab("edit")}
        >
          Editar Empresa
        </button>
      </nav>

      {/* Conteúdo da aba */}
      <div className="md:w-3/4 bg-white rounded-lg shadow p-6">
        {tab === "info" ? (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-text">
              Informações da Empresa
            </h2>
            <p className="text-text-secondary">
              <strong>Nome Fantasia:</strong> {company.nomeFantasia}
            </p>
            {company.razaoSocial && (
              <p className="text-text-secondary">
                <strong>Razão Social:</strong> {company.razaoSocial}
              </p>
            )}
            <p className="text-text-secondary">
              <strong>CNPJ/CPF:</strong> {company.cnpjCpf}
            </p>
            {company.endereco && (
              <p className="text-text-secondary">
                <strong>Endereço:</strong> {company.endereco}
              </p>
            )}
            {company.telefone && (
              <p className="text-text-secondary">
                <strong>Telefone:</strong> {company.telefone}
              </p>
            )}
            {company.email && (
              <p className="text-text-secondary">
                <strong>E-mail:</strong> {company.email}
              </p>
            )}
            <p className="text-text-secondary">
              <strong>Plano:</strong> {company.contrato}
            </p>
          </div>
        ) : (
          <CompanyForm user={user} />
        )}
      </div>
    </div>
  );
}
