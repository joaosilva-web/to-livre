// app/cadastro/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function CadastroPage() {
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        setErrorMessage(error.message || "Erro ao cadastrar.");
        return;
      }

      setSuccess(true);
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro inesperado. Tente novamente.");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow text-center text-green-600 text-xl font-semibold">
          Cadastro realizado com sucesso!
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow max-w-md w-full space-y-6"
      >
        <h1 className="text-2xl font-bold text-center text-primary">
          Crie sua conta
        </h1>

        {errorMessage && (
          <p className="text-red-500 text-sm text-center">{errorMessage}</p>
        )}

        <div>
          <label className="block mb-1 text-text-secondary font-medium">
            Nome
          </label>
          <input
            type="text"
            {...register("name")}
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            placeholder="Seu nome"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-text-secondary font-medium">
            E-mail
          </label>
          <input
            type="email"
            {...register("email")}
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            placeholder="Seu melhor e-mail"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-text-secondary font-medium">
            Senha
          </label>
          <input
            type="password"
            {...register("password")}
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            placeholder="Crie uma senha"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-hover transition ${
            isSubmitting && "opacity-70 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </section>
  );
}
