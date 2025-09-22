"use client";

import { useScrollMotion } from "@/hooks/useScrollMotion";
import Button from "./ui/Button";
import { bounceIn, bounceOut } from "@/animations/motionVariants";
import { motion } from "framer-motion";

export default function ForWhom() {
  const heading = useScrollMotion();
  const card = useScrollMotion();
  const card2 = useScrollMotion();
  const card3 = useScrollMotion();
  const card4 = useScrollMotion();
  const paragraph = useScrollMotion();
  const cta = useScrollMotion();
  return (
    <section id="who" className="py-24 bg-gray-50 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h2
          ref={heading.ref}
          {...(heading.isVisible ? bounceIn(0) : bounceOut)}
          className="text-4xl md:text-5xl font-bold text-primary mb-12"
        >
          Perfeito para quem vive de agenda
        </motion.h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 text-left text-lg font-medium">
          <motion.div
            ref={card.ref}
            {...(card.isVisible ? bounceIn(0) : bounceOut)}
            className="bg-white shadow rounded-xl p-6 flex flex-col items-center gap-2 hover:shadow-lg transition-shadow"
          >
            <span className="text-4xl">💈</span>
            <p className="text-center text-text">Barbeiros e cabeleireiros</p>
          </motion.div>
          <motion.div
            ref={card2.ref}
            {...(card.isVisible ? bounceIn(0) : bounceOut)}
            className="bg-white shadow rounded-xl p-6 flex flex-col items-center gap-2 hover:shadow-lg transition-shadow"
          >
            <span className="text-4xl">🧠</span>
            <p className="text-center text-text">Psicólogos e terapeutas</p>
          </motion.div>
          <motion.div
            ref={card3.ref}
            {...(card3.isVisible ? bounceIn(0) : bounceOut)}
            className="bg-white shadow rounded-xl p-6 flex flex-col items-center gap-2 hover:shadow-lg transition-shadow"
          >
            <span className="text-4xl">📸</span>
            <p className="text-center text-text">Fotógrafos e freelancers</p>
          </motion.div>
          <motion.div
            ref={card4.ref}
            {...(card4.isVisible ? bounceIn(0) : bounceOut)}
            className="bg-white shadow rounded-xl p-6 flex flex-col items-center gap-2 hover:shadow-lg transition-shadow"
          >
            <span className="text-4xl">💅</span>
            <p className="text-center text-text">Manicures e esteticistas</p>
          </motion.div>
        </div>

        <motion.p
          ref={paragraph.ref}
          {...(paragraph.isVisible ? bounceIn(0) : bounceOut)}
          className="text-text text-lg mt-10 max-w-xl mx-auto"
        >
          Não importa sua profissão. Se você atende com horário marcado, o
          Agendaê é pra você.
        </motion.p>

        <motion.div
          ref={cta.ref}
          {...(cta.isVisible ? bounceIn(0) : bounceOut)}
          className="mt-8"
        >
          <Button asLink href="/leads">
            Comece a usar gratuitamente
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
