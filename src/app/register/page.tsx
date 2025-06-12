// app/cadastro/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Input from "../components/ui/Input";

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
    <section
      className="min-h-screen w-full flex items-center justify-center bg-gray-50 bg-cover bg-center px-8"
      style={{ backgroundImage: "url('/calendar.png')" }}
    >
      <div className="w-[50%] h-screen flex flex-col justify-center items-center max-w-full">
        <h1 className="text-6xl text-center font-bold">
          Organize, automatize e viva com mais leveza.
        </h1>
        <p className="text-white text-center text-xl font-medium max-w-lg">
          Agendamentos automáticos, lembretes inteligentes e cobranças sem
          complicação.
        </p>
      </div>
      <div className="w-[50%] flex justify-end items-center">
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

          <Input
            type="text"
            {...register("name")}
            label="Nome"
            placeholder="Seu nome"
            error={errors.name}
          />

          <Input
            type="email"
            {...register("email")}
            label="E-mail"
            placeholder="Seu melhor e-mail"
            error={errors.email}
          />

          <Input
            type="password"
            {...register("password")}
            label="Senha"
            placeholder="Crie uma senha"
            error={errors.password}
          />

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
      </div>
    </section>
  );
}
