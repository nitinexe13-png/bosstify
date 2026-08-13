"use client";

import { fadeUp, staggerContainer } from "@/lib/animations";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export function Hero({ loggedIn }: { loggedIn: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      variants={staggerContainer}
      initial={reduceMotion ? "visible" : "hidden"}
      animate="visible"
      className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center border-b border-[#f0f0f0] px-4 py-20 text-center md:px-6"
    >
      <motion.div
        variants={fadeUp}
        className="inline-flex items-center rounded-full border border-line px-3 py-1"
      >
        <span className="text-[11px] font-medium uppercase tracking-[1.5px] text-gray-500">
          Premium SMM Panel
        </span>
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className="mt-6 max-w-4xl text-[clamp(48px,7vw,80px)] font-bold leading-[1.05] tracking-[-2px] text-black"
      >
        Grow your
        <br />
        social presence
      </motion.h1>

      <motion.p
        variants={fadeUp}
        className="mt-6 max-w-[480px] text-base leading-[1.7] text-gray-400"
      >
        Fast, reliable and affordable social media services. Order in seconds,
        track in real time, and grow across every platform.
      </motion.p>

      <motion.div
        variants={fadeUp}
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <Link
          href={loggedIn ? "/dashboard" : "/signup"}
          className="inline-flex h-12 items-center rounded-btn bg-black px-7 text-base font-medium text-white transition-colors duration-200 hover:bg-gray-800"
        >
          Get Started
        </Link>
        <Link
          href={loggedIn ? "/dashboard" : "/login"}
          className="group inline-flex h-12 items-center gap-2 rounded-btn border border-line bg-transparent px-7 text-base font-medium text-black transition-colors duration-200 hover:bg-gray-50"
        >
          Login
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
        </Link>
      </motion.div>
    </motion.section>
  );
}
