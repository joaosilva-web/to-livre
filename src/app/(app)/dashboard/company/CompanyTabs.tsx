"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CompanyForm from "./CompanyForm";
import WorkingHoursForm from "./WorkingHoursForm";
import ServicesForm from "./ServicesForm";
import { JWTPayload } from "@/app/libs/auth";
import { fadeInDirection } from "@/animations/motionVariants";
import ProfessionalServiceForm from "./ProsefessionalServiceForm";

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
  const [tab, setTab] = useState<"info" | "edit" | "config">("info");
  const [configTab, setConfigTab] = useState<
    "workingHours" | "services" | "professionalServices"
  >("workingHours");

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Subnavegação lateral */}
      <nav className="md:w-1/4 bg-white rounded-lg shadow p-4 flex flex-col gap-2">
        {["info", "edit", "config"].map((t) => (
          <button
            key={t}
            className={`p-2 rounded transition-colors duration-300 hover:bg-background-muted hover:text-primary ${
              tab === t
                ? "bg-background-muted font-semibold text-primary"
                : "text-text"
            }`}
            onClick={() => setTab(t as "info" | "edit" | "config")}
          >
            {t === "info"
              ? "Informações"
              : t === "edit"
              ? "Editar Empresa"
              : "Configurações"}
          </button>
        ))}
      </nav>

      {/* Conteúdo da aba */}
      <div className="md:w-3/4 bg-white rounded-lg shadow p-6 flex flex-col gap-6">
        {tab === "info" && (
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
        )}

        {tab === "edit" && <CompanyForm user={user} />}

        {tab === "config" && (
          <div className="flex flex-col gap-4">
            {/* Sub-abas */}
            <div className="flex gap-2 border-b pb-2">
              <button
                className={`px-4 py-2 rounded-t transition-colors duration-300 ${
                  configTab === "workingHours"
                    ? "bg-background-muted font-semibold text-primary border border-b-0 rounded-t-lg"
                    : "text-text hover:bg-background-muted"
                }`}
                onClick={() => setConfigTab("workingHours")}
              >
                Horários de Funcionamento
              </button>
              <button
                className={`px-4 py-2 rounded-t transition-colors duration-300 ${
                  configTab === "services"
                    ? "bg-background-muted font-semibold text-primary border border-b-0 rounded-t-lg"
                    : "text-text hover:bg-background-muted"
                }`}
                onClick={() => setConfigTab("services")}
              >
                Serviços
              </button>
              <button
                className={`px-4 py-2 rounded-t transition-colors duration-300 ${
                  configTab === "professionalServices"
                    ? "bg-background-muted font-semibold text-primary border border-b-0 rounded-t-lg"
                    : "text-text hover:bg-background-muted"
                }`}
                onClick={() => setConfigTab("professionalServices")}
              >
                Serviços por Profissional
              </button>
            </div>

            {/* Conteúdo das sub-abas animado */}
            <div className="bg-white p-4 rounded-lg shadow min-h-[300px]">
              <AnimatePresence mode="wait">
                {configTab === "workingHours" && (
                  <motion.div
                    key="workingHours"
                    variants={fadeInDirection("right", 20)}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <WorkingHoursForm companyId={company.id} />
                  </motion.div>
                )}
                {configTab === "services" && (
                  <motion.div
                    key="services"
                    variants={fadeInDirection("left", 20)}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <ServicesForm companyId={company.id} />
                  </motion.div>
                )}
                {configTab === "professionalServices" && (
                  <motion.div
                    key="professionalServices"
                    variants={fadeInDirection("up", 20)}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <ProfessionalServiceForm companyId={company.id} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
