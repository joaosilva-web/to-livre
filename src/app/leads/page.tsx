"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from "react";
import { useReward } from "react-rewards";
import { motion } from "framer-motion";
import { useScrollMotion } from "@/hooks/useScrollMotion";
import { bounceIn, bounceOut } from "@/animations/motionVariants";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Image from "next/image";

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
  const card = useScrollMotion();
  const [responseIsOk, setResponseIsOk] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { reward } = useReward("confetti", "confetti", {
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
    <section className="relative pt-[74px] min-h-screen flex items-center justify-center bg-gray-50">
      <Image
        src="/calendar.png"
        alt="Background"
        fill
        className="object-cover"
        priority
      />
      <ReCAPTCHA sitekey={SITE_KEY} size="invisible" ref={recaptchaRef} />
      <Modal
        isOpen={responseIsOk}
        onClose={() => setResponseIsOk(false)}
        title="Você está na nossa lista de espera 🎉"
      >
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-text text-base">
            Estamos muito gratos pelo seu interesse! <br />
            Sempre que tivermos novidades ou atualizações, você será avisado por
            e-mail. 🚀
          </p>
          <Button onClick={() => setResponseIsOk(false)}>Fechar</Button>
        </div>
      </Modal>
      <motion.div
        ref={card.ref}
        {...(card.isVisible ? bounceIn(0.5) : bounceOut)}
        className="relative max-w-md w-full bg-white rounded-2xl shadow p-8 flex justify-center items-center"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <h1 className="text-xl font-bold text-center text-text">
            🏗️App em desenvolvimento.🏗️
          </h1>
          <h2 className="text-xl font-bold text-center text-text">
            Registre-se para receber novidades!
          </h2>

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
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
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

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Quero receber novidades"}
          </Button>
        </form>
      </motion.div>
    </section>
  );
}
