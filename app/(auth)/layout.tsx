import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
      <Link
        href="/"
        className="mb-8 text-3xl font-bold tracking-tight text-black"
      >
        Bosstify
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
