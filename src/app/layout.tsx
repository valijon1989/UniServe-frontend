import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";
import { AppChrome } from "@/components/AppChrome";

export const metadata: Metadata = {
  title: "UniServe",
  description: "Global services and products platform",
  icons: {
    icon: "/favicon.ico"
  }
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
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
