import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bosstify — Premium SMM Panel",
    template: "%s | Bosstify",
  },
  description:
    "Bosstify is a premium SMM panel offering fast delivery of social media services at the best rates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans">{children}</body>
    </html>
  );
}
