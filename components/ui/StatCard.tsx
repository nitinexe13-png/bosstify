"use client";

import { fadeUp } from "@/lib/animations";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function StatCard({
  label,
  value,
  currency = false,
  prefix = "",
  suffix = "",
  className,
}: {
  label: string;
  value: number;
  currency?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, reduceMotion]);

  const formatted = currency
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(display)
    : Math.round(display).toLocaleString("en-US");

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className={className}
    >
      <p className="text-xs uppercase tracking-[1px] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-black md:text-[28px]">
        {prefix}
        {formatted}
        {suffix}
      </p>
    </motion.div>
  );
}
