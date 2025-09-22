"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useState } from "react";
import { useScrollMotion } from "@/hooks/useScrollMotion";
import { motion } from "framer-motion";
import { bounceIn, bounceOut } from "@/animations/motionVariants";

export default function Testimonials() {
  const testimonials = [
    {
      text: "“Antes, eu esquecia clientes. Agora, o Ocupaê me lembra tudo.”",
      author: "Camila, manicure",
    },
    {
      text: "“Melhorou meu atendimento e ainda me ajuda a receber sem atraso.”",
      author: "Felipe, personal trainer",
    },
    {
      text: "“Meus clientes adoram a praticidade. Recomendo sempre!”",
      author: "João, barbeiro",
    },
  ];

  const heading = useScrollMotion();
  const div = useScrollMotion();

  const [currentSlide, setCurrentSlide] = useState(0);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: "snap",
    slides: {
      perView: 1,
      spacing: 16,
    },
    breakpoints: {
      "(min-width: 768px)": {
        slides: { perView: 2, spacing: 24 },
      },
    },
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  return (
    <section id="testimonials" className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          ref={heading.ref}
          {...(heading.isVisible ? bounceIn(0) : bounceOut)}
          className="text-4xl md:text-5xl font-bold text-primary mb-16"
        >
          Quem usa, recomenda
        </motion.h2>

        <motion.div
          ref={div.ref}
          {...(div.isVisible ? bounceIn(0) : bounceOut)}
        >
          <div ref={sliderRef} className="keen-slider mb-8 p-2">
            {testimonials.map((item, i) => (
              <div
                key={i}
                className="keen-slider__slide p-6 rounded-xl shadow hover:shadow-md text-left"
              >
                <p className="text-lg text-text italic mb-4">{item.text}</p>
                <p className="font-semibold text-primary">— {item.author}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bullets */}
        <div className="flex justify-center gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              className={`w-3 h-3 rounded-full transition ${
                currentSlide === idx
                  ? "bg-primary scale-125"
                  : "bg-gray-300 hover:bg-primary/60"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
