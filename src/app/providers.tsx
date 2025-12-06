"use client";

import { ReactNode } from "react";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { I18nProvider } from "@/context/i18n";

export default function Providers({ children }: { children: ReactNode }) {
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
  axios.defaults.withCredentials = true;

  return (
    <I18nProvider>
      {children}
      <Toaster />
    </I18nProvider>
  );
}
