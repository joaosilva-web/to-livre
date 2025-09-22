"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import IconLogo from "./IconLogo";

export default function FullLogo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <IconLogo />
      <AnimatePresence>
        <motion.h1
          className="text-3xl font-bold text-primary"
          initial={{ x: "-10%", width: 0, overflow: "hidden" }}
          animate={{ x: 0, width: "auto" }}
          exit={{ x: "-10%", width: 0, overflow: "hidden" }}
          transition={{
            delay: 0.3,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          Agendaê
        </motion.h1>
      </AnimatePresence>
    </Link>
  );
}
