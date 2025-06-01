import { CalendarCheck, BellRing, CreditCard } from "lucide-react";

export default function HowItWorks() {
  return (
    <section id="how" className="py-24  px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-16">
          Como o TôLivre facilita seu dia a dia
        </h2>

        <div className="grid md:grid-cols-3 gap-12 text-left">
          {/* Etapa 1 */}
          <div className="flex flex-col items-start gap-4">
            <CalendarCheck className="text-primary w-10 h-10" />
            <h3 className="text-xl font-semibold text-gray-800">
              1. Receba agendamentos online
            </h3>
            <p className="text-text text-base">
              Seus clientes escolhem o horário direto pelo link.
            </p>
          </div>

          {/* Etapa 2 */}
          <div className="flex flex-col items-start gap-4">
            <BellRing className="text-primary w-10 h-10" />
            <h3 className="text-xl font-semibold text-gray-800">
              2. Envie lembretes automáticos
            </h3>
            <p className="text-text text-base">
              Reduza faltas com mensagens por WhatsApp e e-mail.
            </p>
          </div>

          {/* Etapa 3 */}
          <div className="flex flex-col items-start gap-4">
            <CreditCard className="text-primary w-10 h-10" />
            <h3 className="text-xl font-semibold text-gray-800">
              3. Receba pagamentos sem esforço
            </h3>
            <p className="text-text text-base">
              Cobranças automatizadas com Pix ou cartão.
            </p>
          </div>
        </div>

        {/* CTA Final */}
        <div className="mt-16">
          <a
            href="#start"
            className="bg-primary text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-primary-hover hover:scale-105 transition"
          >
            Quero experimentar de graça
          </a>
        </div>
      </div>
    </section>
  );
}
