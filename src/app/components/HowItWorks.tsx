"use client";

import { CalendarCheck, BellRing, CreditCard } from "lucide-react";
import Button from "./ui/Button";
import { motion } from "framer-motion";
import { bounceIn, bounceOut } from "@/animations/motionVariants";
import { useScrollMotion } from "@/hooks/useScrollMotion";

export default function HowItWorks() {
  const heading = useScrollMotion();
  const card = useScrollMotion();
  const card2 = useScrollMotion();
  const card3 = useScrollMotion();
  const cta = useScrollMotion();

  return (
    <section id="how" className="py-24  px-6">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          ref={heading.ref}
          {...(heading.isVisible ? bounceIn(0) : bounceOut)}
          className="text-4xl md:text-5xl font-bold text-primary mb-16"
        >
          Como o Agendaê facilita seu dia a dia
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-12 text-left">
          {/* Etapa 1 */}
          <motion.div
            ref={card.ref}
            {...(card.isVisible ? bounceIn(0) : bounceOut)}
            className="flex flex-col items-start gap-4"
          >
            <CalendarCheck className="text-primary w-10 h-10" />
            <h3 className="text-xl font-semibold text-gray-800">
              1. Receba agendamentos online
            </h3>
            <p className="text-text text-base">
              Seus clientes escolhem o horário direto pelo link.
            </p>
          </motion.div>

          {/* Etapa 2 */}
          <motion.div
            ref={card2.ref}
            {...(card2.isVisible ? bounceIn(0) : bounceOut)}
            className="flex flex-col items-start gap-4"
          >
            <BellRing className="text-primary w-10 h-10" />
            <h3 className="text-xl font-semibold text-gray-800">
              2. Envie lembretes automáticos
            </h3>
            <p className="text-text text-base">
              Reduza faltas com mensagens por WhatsApp e e-mail.
            </p>
          </motion.div>

          {/* Etapa 3 */}
          <motion.div
            ref={card3.ref}
            {...(card3.isVisible ? bounceIn(0) : bounceOut)}
            className="flex flex-col items-start gap-4"
          >
            <CreditCard className="text-primary w-10 h-10" />
            <h3 className="text-xl font-semibold text-gray-800">
              3. Receba pagamentos sem esforço
            </h3>
            <p className="text-text text-base">
              Cobranças automatizadas com Pix ou cartão.
            </p>
          </motion.div>
        </div>

        {/* CTA Final */}
        <motion.div
          ref={cta.ref}
          {...(cta.isVisible ? bounceIn(0) : bounceOut)}
          className="mt-16"
        >
          <Button asLink href="/leads" mt="sm">
            Quero experimentar de graça
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
