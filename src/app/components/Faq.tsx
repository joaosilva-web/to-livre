"use client";

import { bounceIn, bounceOut } from "@/animations/motionVariants";
import { useScrollMotion } from "@/hooks/useScrollMotion";
import FAQItem from "./ui/FAQItem";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "Preciso instalar algo?",
    answer:
      "Não! O TôLivre funciona direto do navegador, no seu celular ou computador. Nada para baixar.",
  },
  {
    question: "O que acontece se eu tiver muitos clientes?",
    answer:
      "Ficamos felizes! Nosso sistema é escalável e você pode mudar de plano quando quiser.",
  },
  {
    question: "Tem suporte?",
    answer:
      "Sim! Você pode contar com nosso time para tirar dúvidas. No plano Premium, o suporte é prioritário.",
  },
  {
    question: "Dá pra usar no celular?",
    answer:
      "Com certeza. O TôLivre é responsivo e feito para funcionar perfeitamente no seu smartphone.",
  },
];

export default function FAQ() {
  const heading = useScrollMotion();

  return (
    <section id="faq" className="py-24 px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          ref={heading.ref}
          {...(heading.isVisible ? bounceIn : bounceOut)}
          className="text-4xl md:text-5xl font-bold text-center text-primary mb-12"
        >
          Dúvidas frequentes
        </motion.h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
