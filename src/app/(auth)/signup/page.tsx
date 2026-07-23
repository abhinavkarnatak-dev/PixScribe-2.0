import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a PixScribe account and get free credits to start.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
