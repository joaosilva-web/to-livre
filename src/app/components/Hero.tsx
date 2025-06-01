import Image from "next/image";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-28 pb-16 bg-bg">
      <div className="max-w-6xl w-full mx-auto grid md:grid-cols-2 items-center gap-12">
        {/* Texto */}
        <div className="text-center md:text-left flex flex-col gap-6">
          <h2 className="text-4xl md:text-4xl font-extrabold text-primary leading-tight">
            Sua agenda organizada, clientes lembrados, pagamentos garantidos.
          </h2>

          <p className="text-lg md:text-xl text-text">
            O TôLivre cuida de tudo para você: agendamentos online, lembretes
            automáticos e cobrança sem estresse. Ideal para autônomos que querem
            focar no que fazem de melhor.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
              <a
                href="#start"
                className="bg-primary text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-primary-hover hover:scale-105 transition"
              >
                Comece grátis
              </a>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
              <a
                href="#start"
                className="bg-bg text-primary border px-6 py-3 rounded-xl text-lg font-semibold hover:bg-bg hover:scale-105 transition"
              >
                Veja como funciona
              </a>
            </div>
          </div>
        </div>

        {/* Imagem */}
        <div className="flex justify-center md:justify-end">
          <Image
            src="/mockup.png"
            alt="Mockup da plataforma TôLivre em um celular"
            width={400}
            height={500}
            className="w-full max-w-[360px]"
          />
        </div>
      </div>
    </section>
  );
}
