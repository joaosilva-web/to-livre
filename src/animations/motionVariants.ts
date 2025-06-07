import { Variants } from "framer-motion";

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp: Variants = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 30, opacity: 0 },
};

export const bounceIn: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  exit: { scale: 0.8, opacity: 0 },
};

export const fadeInDirection = (
  direction: "left" | "right" | "up" | "down",
  distance = 40
): Variants => {
  const from = {
    left: { x: -distance, opacity: 0 },
    right: { x: distance, opacity: 0 },
    up: { y: -distance, opacity: 0 },
    down: { y: distance, opacity: 0 },
  };

  return {
    initial: from[direction],
    animate: { x: 0, y: 0, opacity: 1 },
    exit: from[direction],
  };
};

export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
