import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Providers } from "./providers";

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
      <body className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-black text-slate-100">
        <Providers>
          <Header />
          <main className="mx-auto max-w-6xl px-4 pb-10 pt-4">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
