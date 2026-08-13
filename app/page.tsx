import { createClient } from "@/lib/supabase/server";
import { buttonClasses } from "@/components/ui/Button";
import Link from "next/link";

export default async function LandingPage() {
  let loggedIn = false;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    loggedIn = Boolean(user);
  } catch {
    // Supabase unreachable — treat as logged out.
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Bosstify
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href={loggedIn ? "/dashboard" : "/login"}
              className="px-3 py-2 text-sm font-medium text-black transition-opacity hover:opacity-70"
            >
              {loggedIn ? "Dashboard" : "Login"}
            </Link>
            <Link
              href={loggedIn ? "/dashboard" : "/signup"}
              className={buttonClasses({ size: "sm" })}
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b border-line">
          <div className="mx-auto max-w-6xl px-4 py-20 text-center md:px-6 md:py-32">
            <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
              Bosstify
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
              Premium SMM Panel — grow your social media presence with fast,
              reliable and affordable services.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href={loggedIn ? "/dashboard" : "/signup"} className={buttonClasses({ size: "lg" })}>
                Get Started
              </Link>
              <Link
                href={loggedIn ? "/dashboard" : "/login"}
                className={buttonClasses({ size: "lg", variant: "secondary" })}
              >
                Login
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
            <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">
              Why choose Bosstify?
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Fast Delivery",
                  description:
                    "Orders are processed and started within minutes of placing them.",
                },
                {
                  title: "Secure Payments",
                  description:
                    "Your balance and payment details are protected at every step.",
                },
                {
                  title: "24/7 Support",
                  description:
                    "Our team is always available to help with any order or question.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-card border border-line bg-white p-6"
                >
                  <div className="h-1.5 w-8 rounded-full bg-black" />
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <p className="text-sm font-semibold">Bosstify</p>
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} Bosstify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
