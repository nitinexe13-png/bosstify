"use client";

import { staggerContainer, fadeUp } from "@/lib/animations";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { formatINR } from "@/lib/utils";
import type { Service } from "@/types";

export function ServicesPreview({ services }: { services: Service[] }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of services) {
      if (s.category) set.add(s.category);
    }
    return ["All", ...[...set].sort()];
  }, [services]);

  const visible = useMemo(() => {
    const list =
      active === "All"
        ? services
        : services.filter((s) => s.category === active);
    return list.slice(0, 6);
  }, [services, active]);

  return (
    <section id="services" className="border-b border-[#f0f0f0] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <motion.div
          variants={staggerContainer}
          initial={reduceMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.h2
            variants={fadeUp}
            className="text-center text-4xl font-bold tracking-tight text-black md:text-5xl"
          >
            What we offer
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-3 max-w-md text-center text-sm leading-[1.7] text-gray-400"
          >
            A growing catalogue of services across every major platform.
          </motion.p>
        </motion.div>

        {services.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActive(category)}
                className={`rounded-full border px-4 py-2 text-[13px] transition-colors duration-200 ${
                  active === category
                    ? "border-black bg-black text-white"
                    : "border-line bg-transparent text-gray-500 hover:border-gray-300 hover:text-black"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {visible.length > 0 ? (
          <motion.div
            key={active}
            variants={staggerContainer}
            initial={reduceMotion ? "visible" : "hidden"}
            animate="visible"
            className="mt-10 grid gap-4 md:grid-cols-2"
          >
            {visible.map((service) => (
              <motion.div
                key={service.id}
                variants={fadeUp}
                className="flex items-start justify-between gap-4 border border-[#f0f0f0] bg-white p-6 transition-[border-color,transform] duration-250 ease-out hover:-translate-y-[2px] hover:border-black"
              >
                <div>
                  <h3 className="text-[15px] font-semibold text-black">
                    {service.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Min {service.min_qty} — Max {service.max_qty}
                  </p>
                </div>
                <p className="whitespace-nowrap text-[15px] font-semibold text-black">
                  {formatINR(service.price_inr)}
                  <span className="font-normal text-gray-400">/1k</span>
                </p>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="mt-10 text-center text-sm text-gray-400">
            Services are being added — check back soon.
          </p>
        )}

        <div className="mt-10 text-center">
          <a
            href="/signup"
            className="group inline-flex items-center gap-2 text-sm font-medium text-black transition-colors duration-150"
          >
            View all services
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              animate={{ x: 0 }}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              aria-hidden
            >
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </a>
        </div>
      </div>
    </section>
  );
}
