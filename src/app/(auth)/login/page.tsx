import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your PixScribe account.",
};

export default function LoginPage() {
  return (
    // AuthForm reads `?next=` via useSearchParams, which needs a Suspense boundary.
    <Suspense fallback={<div className="h-96" />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
