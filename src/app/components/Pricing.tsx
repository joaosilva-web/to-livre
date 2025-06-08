"use client";

import { useState } from "react";
import Button from "./ui/Button";
import { useScrollMotion } from "@/hooks/useScrollMotion";
import { motion } from "framer-motion";
import { bounceIn, bounceOut } from "@/animations/motionVariants";

export default function Pricing() {
  const heading = useScrollMotion();
  const paragraph = useScrollMotion();
  const cta = useScrollMotion();
  const ctaFim = useScrollMotion();
  const table = useScrollMotion(0.2);
  const [isAnnual, setIsAnnual] = useState(false);

  const prices = {
    pro: isAnnual ? "R$290/ano" : "R$29/mês",
    premium: isAnnual ? "R$490/ano" : "R$49/mês",
  };

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          ref={heading.ref}
          {...(heading.isVisible ? bounceIn : bounceOut)}
          className="text-4xl md:text-5xl font-bold text-primary mb-4"
        >
          Comece grátis. Sem cartão. Só quando você crescer.
        </motion.h2>

        <motion.p
          ref={paragraph.ref}
          {...(paragraph.isVisible ? bounceIn : bounceOut)}
          className="text-text text-lg mb-8 max-w-xl mx-auto"
        >
          Planos pensados para acompanhar o seu crescimento.
        </motion.p>

        {/* Toggle */}
        <motion.div
          ref={cta.ref}
          {...(cta.isVisible ? bounceIn : bounceOut)}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <Button
            variant={!isAnnual ? "primary" : "secondary"}
            size="sm"
            onClick={() => setIsAnnual(false)}
          >
            Mensal
          </Button>
          <Button
            variant={isAnnual ? "primary" : "secondary"}
            size="sm"
            onClick={() => setIsAnnual(true)}
          >
            Anual
          </Button>
        </motion.div>

        {/* Tabela */}
        <motion.div
          ref={table.ref}
          {...(table.isVisible ? bounceIn : bounceOut)}
          className="overflow-x-auto"
        >
          <table className="w-full border-collapse text-left rounded-xl overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-text">
                <th className="p-4 text-base font-semibold">Funcionalidade</th>

                <th className="p-4 text-center font-semibold text-primary relative">
                  Grátis
                  <div className="text-xs text-gray-500 mt-1">R$0</div>
                </th>

                <th className="p-4 text-center font-semibold text-blue-600 bg-blue-50 border-2 border-blue-500 scale-105 rounded-t-xl">
                  Pro
                  <div className="text-xs text-gray-600 mt-1">{prices.pro}</div>
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full shadow">
                    Mais popular
                  </span>
                </th>

                <th className="p-4 text-center font-semibold text-purple-600 bg-purple-50 rounded-t-xl">
                  Premium
                  <div className="text-xs text-gray-600 mt-1">
                    {prices.premium}
                  </div>
                  <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full shadow">
                    Recomendado
                  </span>
                </th>
              </tr>
            </thead>

            <tbody className="text-sm md:text-base">
              {[
                ["Agendamento online com link personalizado", true, true, true],
                ["Horários e dias configuráveis", true, true, true],
                ["Confirmação automática por e-mail", true, true, true],
                ["Zero comissão", true, true, true],
                ["Lembretes por e-mail", false, true, true],
                ["Recebimentos por Pix ou link", false, true, true],
                ["Painel com agenda e clientes", false, true, true],
                ["Lembretes via WhatsApp", false, false, true],
                ["Histórico de atendimentos", false, false, true],
                ["Suporte prioritário", false, false, true],
              ].map(([feature, free, pro, premium], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-4">{feature}</td>
                  <td className="p-4 text-center">{free ? "✅" : "❌"}</td>
                  <td className="p-4 text-center">{pro ? "✅" : "❌"}</td>
                  <td className="p-4 text-center">{premium ? "✅" : "❌"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
        <motion.div
          ref={ctaFim.ref}
          {...(ctaFim.isVisible ? bounceIn : bounceOut)}
        >
          <Button asLink href="/leads" mt="xlg">
            Quero começar de graça
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
