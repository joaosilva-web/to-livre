"use client";

import { useState } from "react";

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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-primary mb-12">
          Dúvidas frequentes
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full text-left px-6 py-4 flex justify-between items-center text-text font-medium hover:bg-gray-100 transition"
              >
                {faq.question}
                <span className="text-xl">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
