"use client";

import { fadeIn, fadeUp } from "@/lib/animations";
import { motion, useReducedMotion } from "framer-motion";

export function AnimatedSection({
  children,
  className,
  delay = 0,
  variant = "fadeUp",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "fadeUp" | "fadeIn";
}) {
  const reduceMotion = useReducedMotion();
  const v = variant === "fadeIn" ? fadeIn : fadeUp;

  return (
    <motion.div
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: v.hidden,
        visible: {
          ...v.visible,
          transition: {
            ...(v.visible as { transition?: object }).transition,
            delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
