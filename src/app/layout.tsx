import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "UniServe",
  description: "Global services and products platform"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className="min-h-screen bg-gradient-to-b from-[#faf7f2] via-[#f7f1e8] to-[#f2e9dd] text-slate-900">
        <Providers>
          <Header />
          <main className="mx-auto max-w-6xl px-4 pb-10 pt-4">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
