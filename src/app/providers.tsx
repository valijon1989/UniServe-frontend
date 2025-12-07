"use client";

import { ReactNode } from "react";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { I18nProvider } from "@/context/i18n";
import { AuthProvider } from "@/context/AuthContext";

export default function Providers({ children }: { children: ReactNode }) {
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
  axios.defaults.withCredentials = true;

  return (
    <I18nProvider>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </I18nProvider>
  );
}
