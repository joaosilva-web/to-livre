"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { JWTPayload } from "@/app/libs/auth";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";

interface CompanyFormData {
  nomeFantasia: string;
  razaoSocial?: string;
  cnpjCpf: string;
  endereco?: string;
  telefone?: string;
  email?: string;
}

interface Props {
  user: JWTPayload;
}

export default function CompanyForm({ user }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CompanyFormData>();
  const [loading, setLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<string[]>([]);

  // Preenche o formulário se o usuário já tiver empresa
  useEffect(() => {
    async function fetchCompany() {
      if (!user.companyId) return;
      const res = await fetch(`/api/company/${user.companyId}`);
      if (res.ok) {
        const data = await res.json();
        Object.keys(data).forEach((key) => {
          setValue(key as keyof CompanyFormData, data[key]);
        });
      }
    }
    fetchCompany();
  }, [user.companyId, setValue]);

  const onSubmit = async (data: CompanyFormData) => {
    setLoading(true);
    setApiErrors([]);
    try {
      const res = await fetch("/api/company", {
        method: user.companyId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.error && Array.isArray(result.error)) {
          // Zod errors
          setApiErrors(result.error.map((e: any) => e.message));
        } else if (result.error) {
          setApiErrors([result.error]);
        }
        setLoading(false);
        return;
      }

      alert("Empresa salva com sucesso!");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setApiErrors(["Erro inesperado ao salvar a empresa"]);
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto p-6 bg-white rounded shadow-md flex flex-col gap-4"
    >
      <Input
        {...register("nomeFantasia", {
          required: "Nome fantasia é obrigatório",
        })}
        placeholder="Nome Fantasia"
      />
      {errors.nomeFantasia && (
        <span className="text-red-500">{errors.nomeFantasia.message}</span>
      )}

      <Input {...register("razaoSocial")} placeholder="Razão Social" />

      <Input
        {...register("cnpjCpf", { required: "CNPJ/CPF é obrigatório" })}
        placeholder="CNPJ/CPF"
      />
      {errors.cnpjCpf && (
        <span className="text-red-500">{errors.cnpjCpf.message}</span>
      )}

      <Input {...register("endereco")} placeholder="Endereço" />
      <Input {...register("telefone")} placeholder="Telefone" />
      <Input {...register("email")} placeholder="E-mail" />

      {apiErrors.length > 0 && (
        <ul className="text-red-500 list-disc pl-5">
          {apiErrors.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
      )}

      <Button size="sm" type="submit" disabled={loading}>
        {loading
          ? "Salvando..."
          : user.companyId
          ? "Atualizar Empresa"
          : "Criar Empresa"}
      </Button>
    </form>
  );
}
