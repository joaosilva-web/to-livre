"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useRef } from "react";
import { useScrollMotion } from "@/hooks/useScrollMotion";
import { AnimatePresence, motion } from "framer-motion";
import { bounceIn, bounceOut } from "@/animations/motionVariants";
import { useReward } from "react-rewards";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Modal from "@/app/components/ui/Modal";
import ReCAPTCHA from "react-google-recaptcha";

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Nome é obrigatório" }),
    email: z.string().email({ message: "E-mail inválido" }),
    password: z
      .string()
      .min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
    confirmPassword: z.string({ message: "Confirmar a senha é obrigatório" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const loginSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loginForm = useScrollMotion();
  const registerForm = useScrollMotion();
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  const {
    register,
    handleSubmit: handleRegisterSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: loginIsSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onRegister = async (data: RegisterFormData) => {
    try {
      // If site key provided, get recaptcha token
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      let recaptchaToken: string | null | undefined;
      if (siteKey && recaptchaRef.current) {
        recaptchaToken = await recaptchaRef.current.executeAsync();
        // executeAsync can return null in some error cases
        if (recaptchaToken === null) recaptchaToken = undefined;
        recaptchaRef.current.reset();
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, recaptchaToken }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const msg =
          body?.message ||
          body?.error ||
          res.statusText ||
          "Erro ao cadastrar.";
        setErrorMessage(msg);
        return;
      }

      setSuccess(true);
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro inesperado. Tente novamente.");
    }
  };

  const onLogin = async (data: LoginFormData) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      setErrorMessage("Login inválido");
      return;
    }

    window.location.href = "/dashboard";
  };

  const { reward: confettiReward } = useReward("confettiReward", "confetti", {
    elementCount: 150,
    elementSize: 16,
    spread: 250,
  });

  useEffect(() => {
    if (success) {
      confettiReward();
    }
  }, [success, confettiReward]);

  return (
    <section
      className="min-h-screen w-full flex items-center justify-center bg-gray-50 bg-cover bg-center px-8"
      style={{ backgroundImage: "url('/calendar.png')" }}
    >
      <div className="w-[50%] h-screen flex flex-col justify-center items-center max-w-full">
        <h1 className="text-6xl text-center font-bold text-white">
          Organize, automatize e viva com mais leveza.
        </h1>
        <p className="text-white text-center text-xl font-medium max-w-lg">
          Agendamentos automáticos, lembretes inteligentes e cobranças sem
          complicação.
        </p>
      </div>

      <div className="w-[50%] flex justify-end items-center">
        <AnimatePresence mode="wait">
          {isLoginForm ? (
            <motion.form
              key="login"
              ref={loginForm.ref}
              {...(isLoginForm ? bounceIn(0) : bounceOut)}
              onSubmit={handleLoginSubmit(onLogin)}
              className="bg-white p-8 rounded-2xl shadow max-w-md w-full space-y-4 pb-6"
            >
              <h1 className="text-2xl font-bold text-center text-primary">
                Entrar na sua conta
              </h1>

              {errorMessage && (
                <p className="text-red-500 text-sm text-center">
                  {errorMessage}
                </p>
              )}

              <Input
                type="email"
                {...loginRegister("email")}
                label="E-mail"
                placeholder="Seu e-mail"
                error={loginErrors.email}
              />

              <Input
                type="password"
                {...loginRegister("password")}
                label="Senha"
                placeholder="Sua senha"
                error={loginErrors.password}
              />

              <Button type="submit" disabled={loginIsSubmitting} w="full">
                {loginIsSubmitting ? "Entrando..." : "Entrar"}
              </Button>

              <div className="flex justify-center items-center">
                <span
                  className="underline cursor-pointer text-blue-400 text-center text-sm"
                  onClick={() => {
                    setIsLoginForm(false);
                    setErrorMessage("");
                  }}
                >
                  Não tem uma conta? Cadastre-se
                </span>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              ref={registerForm.ref}
              {...(!isLoginForm ? bounceIn(0) : bounceOut)}
              onSubmit={handleRegisterSubmit(onRegister)}
              className="bg-white p-8 rounded-2xl shadow max-w-md w-full space-y-4 pb-6"
            >
              {/* ReCAPTCHA: only rendered if site key exists */}
              {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  size="invisible"
                  ref={recaptchaRef}
                />
              )}
              <h1 className="text-2xl font-bold text-center text-primary">
                Crie sua conta
              </h1>

              {errorMessage && (
                <p className="text-red-500 text-sm text-center">
                  {errorMessage}
                </p>
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

              <Input
                type="password"
                {...register("confirmPassword")}
                label="Confirme a senha"
                placeholder="Confirme a senha"
                error={errors.confirmPassword}
              />

              <Button type="submit" disabled={isSubmitting} w="full">
                {isSubmitting ? "Cadastrando..." : "Cadastrar"}
              </Button>

              <div className="flex justify-center items-center">
                <span
                  className="underline cursor-pointer text-blue-400 text-center text-sm"
                  onClick={() => {
                    setIsLoginForm(true);
                    setErrorMessage("");
                  }}
                >
                  Já possui uma conta? Entrar
                </span>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <Modal
        isOpen={success}
        onClose={() => {
          setSuccess(false);
          setIsLoginForm(true);
        }}
        title="Cadastro realizado 🎉"
      >
        <span id="confettiReward" className="relative inset-x-[50%]" />
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-text text-base">
            Sua conta foi criada com sucesso! <br /> Agora é só fazer login para
            começar a usar o Ocupaê.
          </p>

          <Button
            onClick={() => {
              setSuccess(false);
              setIsLoginForm(true);
            }}
          >
            Fazer login
          </Button>
        </div>
      </Modal>
    </section>
  );
}
