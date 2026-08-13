"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "#services", label: "Services" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar({ loggedIn }: { loggedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 8);
  });

  const dashboardHref = loggedIn ? "/dashboard" : "/login";

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white transition-colors duration-200 ${
        scrolled ? "border-gray-200" : "border-[#f0f0f0]"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-black"
          onClick={() => setMenuOpen(false)}
        >
          Bosstify
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-500 transition-colors duration-150 hover:text-black"
            >
              {link.label}
            </a>
          ))}
          <Link
            href={dashboardHref}
            className="text-sm font-medium text-gray-500 transition-colors duration-150 hover:text-black"
          >
            Dashboard
          </Link>
        </nav>

        <div className="hidden md:block">
          <Link
            href={loggedIn ? "/dashboard" : "/signup"}
            className="inline-flex h-10 items-center rounded-btn bg-black px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-btn text-black transition-colors hover:bg-gray-50 md:hidden"
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden>
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-line bg-white md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-btn px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors duration-150 hover:bg-gray-50 hover:text-black"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href={dashboardHref}
                onClick={() => setMenuOpen(false)}
                className="block rounded-btn px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors duration-150 hover:bg-gray-50 hover:text-black"
              >
                Dashboard
              </Link>
              <Link
                href={loggedIn ? "/dashboard" : "/signup"}
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex h-10 items-center justify-center rounded-btn bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
