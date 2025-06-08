import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export function useScrollMotion(threshold = 0.5) {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: threshold });
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(isInView);
  }, [isInView]);

  return { ref, isVisible };
}
