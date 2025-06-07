"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from "react";
import { useReward } from "react-rewards";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;

const leadSchema = z.object({
  name: z.string().min(2, { message: "Nome obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }),
  interest: z.enum(["sim", "nao", "talvez"], {
    errorMap: () => ({ message: "Selecione uma opção" }),
  }),
});

type LeadFormData = z.infer<typeof leadSchema>;

export default function LeadsPage() {
  const [responseIsOk, setResponseIsOk] = useState<boolean>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { reward, isAnimating } = useReward("confetti", "confetti", {
    spread: 90,
    elementCount: 100,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    if (!recaptchaRef.current) {
      setErrorMessage("Erro ao inicializar o reCAPTCHA.");
      return;
    }
    const token = await recaptchaRef.current.executeAsync();

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, recaptchaToken: token }),
      });

      if (!res.ok) {
        const error = await res.json();
        setErrorMessage(error.error);
        setResponseIsOk(false);
        return;
      }
      setResponseIsOk(true);
      reset();
      reward();
      console.log("Lead salvo com sucesso!");
    } catch (err) {
      console.log(err);
      setResponseIsOk(false);
    }
  };

  return (
    <section className="pt-[74] min-h-screen flex items-center justify-center bg-gray-50">
      <ReCAPTCHA sitekey={SITE_KEY} size="invisible" ref={recaptchaRef} />
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow p-8 flex justify-center items-center">
        <span id="confetti" />
        {responseIsOk ? (
          <div className="text-center text-primary text-xl font-semibold">
            <button
              className="absolute top-4 left-8 cursor-pointer"
              onClick={() => setResponseIsOk(false)}
            >
              <ArrowLeft />
            </button>
            <p className="mt-3">
              Obrigado! Agora você ficara por dentro de todas as atualizações e
              novidades!✨
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h1 className="text-2xl font-bold text-center text-primary">
              Quero ficar por dentro das Novidades até o lançamento!
            </h1>

            <div>
              {errorMessage && (
                <div className="mt-4 text-center text-red-600 text-sm font-medium mb-4">
                  {errorMessage}
                </div>
              )}
              <label className="block mb-1 font-medium text-text-secondary">
                Nome
              </label>
              <input
                type="text"
                {...register("name")}
                className="py-2 px-4 text-text-secondary block w-full rounded-md border-gray-300 shadow-sm focus:outline-primary"
                placeholder="Seu nome"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium text-text-secondary">
                E-mail
              </label>
              <input
                type="email"
                {...register("email")}
                className="py-2 px-4 text-text-secondary block w-full rounded-md border-gray-300 shadow-sm focus:outline-primary"
                placeholder="Seu melhor e-mail"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium text-text-secondary">
                Você tem interesse em assinar algum plano no lançamento?
              </label>
              <select
                {...register("interest")}
                className="py-2 px-4 text-text-secondary block w-full rounded-md border-gray-300 shadow-sm focus:outline-primary"
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
                <option value="talvez">Talvez</option>
              </select>
              {errors.interest && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.interest.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-primary text-white py-2 rounded-lg transition hover:bg-primary-hover ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Enviando..." : "Quero ser avisado"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
