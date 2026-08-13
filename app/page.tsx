import { Hero } from "@/components/landing/Hero";
import { ServicesPreview } from "@/components/landing/ServicesPreview";
import { Navbar } from "@/components/layout/Navbar";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { StatCard } from "@/components/ui/StatCard";
import { createClient } from "@/lib/supabase/server";
import { toNumber } from "@/lib/utils";
import type { Service } from "@/types";
import Link from "next/link";

export default async function LandingPage() {
  let loggedIn = false;
  let services: Service[] = [];

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    loggedIn = Boolean(user);

    const { data } = await supabase
      .from("services_cache")
      .select("*")
      .eq("is_active", true)
      .order("category")
      .order("price_inr")
      .limit(30);

    services = (data ?? []).map((s) => ({
      ...s,
      rate: toNumber(s.rate),
      min: toNumber(s.min),
      max: toNumber(s.max),
      price_inr: toNumber(s.price_inr),
      min_qty: toNumber(s.min_qty),
      max_qty: toNumber(s.max_qty),
      is_active: true,
      refill: Boolean(s.refill),
      cancel: Boolean(s.cancel),
    }));
  } catch {
    // Supabase unreachable — render with empty services.
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar loggedIn={loggedIn} />

      <main className="flex-1">
        <Hero loggedIn={loggedIn} />

        <section className="border-b border-[#f0f0f0]">
          <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-[#f0f0f0] px-4 py-8 sm:grid-cols-3 sm:divide-x sm:divide-y-0 md:px-6">
            <StatCard
              label="Orders Completed"
              value={50}
              suffix="K+"
              className="py-6 text-center sm:px-8 sm:first:pl-0 sm:last:pr-0"
            />
            <StatCard
              label="Satisfaction"
              value={99}
              suffix="%"
              className="py-6 text-center sm:px-8"
            />
            <StatCard
              label="Support"
              value={24}
              suffix="/7"
              className="py-6 text-center sm:px-8"
            />
          </div>
        </section>

        <section className="border-b border-[#f0f0f0] py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <AnimatedSection>
              <h2 className="text-center text-4xl font-bold tracking-tight text-black md:text-5xl">
                Simple. Fast. Reliable.
              </h2>
            </AnimatedSection>

            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Pick a service",
                  description:
                    "Browse our catalogue, choose a service and set your quantity. Clear pricing from the start.",
                },
                {
                  step: "02",
                  title: "Fund your account",
                  description:
                    "Add balance via UPI or bank transfer. Orders are deducted instantly from your balance.",
                },
                {
                  step: "03",
                  title: "Place your order",
                  description:
                    "Submit the link, confirm the charge, and our team starts working on it right away.",
                },
              ].map((item, index) => (
                <AnimatedSection key={item.step} delay={index * 0.1}>
                  <div className="border-t border-line pt-6 transition-colors duration-300 hover:border-black">
                    <p className="text-[11px] font-semibold uppercase tracking-[2px] text-gray-300">
                      {item.step}
                    </p>
                    <h3 className="mt-3 text-lg font-semibold text-black">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-[1.7] text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#f0f0f0] py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <AnimatedSection>
              <h2 className="text-center text-4xl font-bold tracking-tight text-black md:text-5xl">
                Built to be effortless
              </h2>
            </AnimatedSection>

            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
                      <path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12L13 2z" strokeLinejoin="round" />
                    </svg>
                  ),
                  title: "Instant processing",
                  description:
                    "Orders are picked up by our team within minutes of being placed.",
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
                      <path d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z" strokeLinejoin="round" />
                    </svg>
                  ),
                  title: "Secure by design",
                  description:
                    "Your balance and account are protected at every step.",
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
                      <path d="M21 12a9 9 0 11-2.6-6.4M21 3v6h-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  title: "Always on",
                  description:
                    "24/7 support whenever you need help with an order.",
                },
              ].map((feature, index) => (
                <AnimatedSection key={feature.title} delay={index * 0.1}>
                  <div className="h-full border border-[#f0f0f0] bg-white p-7 transition-[border-color,transform] duration-250 ease-out hover:-translate-y-[2px] hover:border-black">
                    <div className="text-black">{feature.icon}</div>
                    <h3 className="mt-4 text-base font-semibold text-black">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-[1.7] text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <ServicesPreview services={services} />

        <section id="pricing" className="bg-black py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
            <AnimatedSection>
              <h2 className="text-[clamp(36px,5vw,48px)] font-bold leading-[1.1] tracking-tight text-white">
                Start growing today
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base leading-[1.7] text-white/50">
                Create your account in under a minute. Add funds when you are
                ready and start ordering.
              </p>
              <div className="mt-10">
                <Link
                  href={loggedIn ? "/dashboard" : "/signup"}
                  className="inline-flex h-12 items-center rounded-btn bg-white px-8 text-base font-medium text-black transition-colors duration-200 hover:bg-white/90"
                >
                  Create free account
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#f0f0f0] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 md:flex-row md:items-start md:justify-between md:px-6">
          <div>
            <p className="text-lg font-bold tracking-tight text-black">
              Bosstify
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-400">
              Premium SMM panel — grow your social presence with fast, reliable
              services.
            </p>
          </div>
          <nav className="flex flex-col gap-3">
            <a
              href="#services"
              className="text-sm text-gray-400 transition-colors duration-150 hover:text-black"
            >
              Services
            </a>
            <Link
              href={loggedIn ? "/dashboard" : "/login"}
              className="text-sm text-gray-400 transition-colors duration-150 hover:text-black"
            >
              Dashboard
            </Link>
            <Link
              href={loggedIn ? "/dashboard" : "/login"}
              className="text-sm text-gray-400 transition-colors duration-150 hover:text-black"
            >
              Login
            </Link>
          </nav>
        </div>
        <div className="border-t border-[#f0f0f0]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 md:px-6">
            <p className="text-[13px] text-gray-300">
              © {new Date().getFullYear()} Bosstify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
