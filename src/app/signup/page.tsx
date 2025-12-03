"use client";

import { AuthRoute } from "@/components/guards/AuthRoute";
import AuthSignupPage from "../auth/signup/page";

export default function SignupWrapper() {
  return (
    <AuthRoute>
      <AuthSignupPage />
    </AuthRoute>
  );
}
