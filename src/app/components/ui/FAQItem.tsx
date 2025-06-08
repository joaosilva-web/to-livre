"use client";

import { bounceIn, bounceOut } from "@/animations/motionVariants";
import { useScrollMotion } from "@/hooks/useScrollMotion";
import { motion } from "framer-motion";
import { useState } from "react";

type FAQItemProps = {
  question: string;
  answer: string;
};

export default function FAQItem({ question, answer }: FAQItemProps) {
  const { ref, isVisible } = useScrollMotion();
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      ref={ref}
      {...(isVisible ? bounceIn : bounceOut)}
      className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-6 py-4 flex justify-between items-center text-text font-medium hover:bg-gray-100 transition cursor-pointer"
      >
        {question}
        <span className="text-xl">{open ? "−" : "+"}</span>
      </button>

      {open && <div className="px-6 pb-4 text-gray-600">{answer}</div>}
    </motion.div>
  );
}
