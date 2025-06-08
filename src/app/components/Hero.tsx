"use client";

import Image from "next/image";
import Button from "./ui/Button";
import { motion } from "framer-motion";
import { bounceIn, bounceOut } from "@/animations/motionVariants";
import { useScrollMotion } from "@/hooks/useScrollMotion";

export default function Hero() {
  const heading = useScrollMotion();
  const paragraph = useScrollMotion();
  const cta = useScrollMotion();
  const div = useScrollMotion();

  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-28 bg-bg">
      <div className="max-w-6xl w-full mx-auto grid md:grid-cols-2 items-center gap-12">
        {/* Texto */}
        <div className="text-center md:text-left flex flex-col gap-6">
          <motion.h2
            ref={heading.ref}
            {...(heading.isVisible ? bounceIn : bounceOut)}
            className="text-4xl md:text-4xl font-extrabold text-primary leading-tight"
          >
            Sua agenda organizada, clientes lembrados, pagamentos garantidos.
          </motion.h2>

          <motion.p
            ref={paragraph.ref}
            {...(paragraph.isVisible ? bounceIn : bounceOut)}
            className="text-lg md:text-xl text-text"
          >
            O TôLivre cuida de tudo para você: agendamentos online, lembretes
            automáticos e cobrança sem estresse. Ideal para autônomos que querem
            focar no que fazem de melhor.
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
            <motion.div
              ref={cta.ref}
              {...(cta.isVisible ? bounceIn : bounceOut)}
              className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2"
            >
              <Button asLink href="/leads">
                Comece grátis
              </Button>
            </motion.div>
            <motion.div
              ref={cta.ref}
              {...(cta.isVisible ? bounceIn : bounceOut)}
              className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2"
            >
              <Button asLink href="/leads" variant="outlined">
                Veja como funciona
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Imagem */}
        <motion.div
          ref={div.ref}
          {...(div.isVisible ? bounceIn : bounceOut)}
          className="flex justify-center md:justify-end"
        >
          <Image
            src="/mockup.png"
            alt="Mockup da plataforma TôLivre em um celular"
            width={400}
            height={500}
            className="w-full max-w-[360px]"
          />
        </motion.div>
      </div>
    </section>
  );
}
