"use client";

import { AuthRoute } from "@/components/guards/AuthRoute";
import AuthLoginPage from "../auth/login/page";

export default function LoginWrapper() {
  return (
    <AuthRoute>
      <AuthLoginPage />
    </AuthRoute>
  );
}
