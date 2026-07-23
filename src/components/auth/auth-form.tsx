"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/providers/toast-provider";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { loginSchema, signupSchema } from "@/lib/validation/schemas";
import type { PublicUser } from "@/server/services/auth.service";
import { PasswordStrength } from "@/components/auth/password-strength";

type Mode = "login" | "signup";

interface Values {
  name: string;
  email: string;
  password: string;
}

const EMPTY: Values = { name: "", email: "", password: "" };

/**
 * Login and signup share one component so switching modes is a state change,
 * not a navigation - the fields you already filled survive the switch.
 *
 * Validation runs client-side with the same Zod schemas the API uses, then the
 * server's field-level errors are merged in on failure.
 */
export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const { toast } = useToast();

  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";
  const schema = isSignup ? signupSchema : loginSchema;

  const update = (key: keyof Values) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [key]: value }));
    // Clear a field's error as soon as the user starts correcting it.
    if (errors[key]) setErrors((current) => ({ ...current, [key]: "" }));
    setFormError(null);
  };

  /** Validates one field on blur so problems surface before submit. */
  const blur = (key: keyof Values) => () => {
    setTouched((current) => ({ ...current, [key]: true }));
    const payload = isSignup
      ? values
      : { email: values.email, password: values.password };
    const result = schema.safeParse(payload);
    if (result.success) {
      setErrors((current) => ({ ...current, [key]: "" }));
      return;
    }
    const issue = result.error.issues.find((item) => item.path[0] === key);
    setErrors((current) => ({ ...current, [key]: issue?.message ?? "" }));
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const payload = isSignup
      ? values
      : { email: values.email, password: values.password };

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        next[key] ??= issue.message;
      }
      setErrors(next);
      setTouched({ name: true, email: true, password: true });
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiRequest<{ user: PublicUser }>(
        isSignup ? "/api/auth/signup" : "/api/auth/login",
        { method: "POST", body: parsed.data },
      );

      setUser(data.user);
      toast({
        tone: "success",
        title: isSignup ? `Welcome to PixScribe, ${data.user.name}` : "Welcome back",
        description: isSignup
          ? `You have ${data.user.credits} free credits to start with.`
          : undefined,
      });

      // Send the user back to whatever they were trying to reach.
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : "/studio");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError) {
        if (error.details) {
          const next: Record<string, string> = {};
          for (const [key, messages] of Object.entries(error.details)) {
            next[key] = messages[0] ?? "";
          }
          setErrors(next);
        }
        // A form-level banner for anything not attributable to one field.
        if (!error.details || error.code === "INVALID_CREDENTIALS") {
          setFormError(error.message);
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-4xl text-bright">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-3 text-[15px] text-muted">
            {isSignup
              ? "Three free credits, no card needed."
              : "Pick up where you left off."}
          </p>
        </motion.div>
      </AnimatePresence>

      <form onSubmit={onSubmit} noValidate className="mt-8">
        <AnimatePresence initial={false}>
          {formError ? (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              role="alert"
              className="flex items-start gap-2.5 overflow-hidden rounded-xl border border-danger/30 bg-danger/10 p-3.5"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
              <p className="text-[13px] leading-relaxed text-danger">{formError}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex flex-col gap-1">
          <AnimatePresence initial={false}>
            {isSignup ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <Field
                  label="Name"
                  name="name"
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  value={values.name}
                  onChange={update("name")}
                  onBlur={blur("name")}
                  error={touched.name ? errors.name || undefined : undefined}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <Field
            label="Email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={update("email")}
            onBlur={blur("email")}
            error={touched.email ? errors.email || undefined : undefined}
          />

          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder={isSignup ? "At least 8 characters" : "Your password"}
            value={values.password}
            onChange={update("password")}
            onBlur={blur("password")}
            error={touched.password ? errors.password || undefined : undefined}
          />

          {isSignup ? <PasswordStrength value={values.password} /> : null}
        </div>

        <Button type="submit" loading={submitting} className="mt-6 w-full" size="lg">
          {submitting
            ? isSignup
              ? "Creating account"
              : "Signing in"
            : isSignup
              ? "Create account"
              : "Sign in"}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-muted">
        {isSignup ? "Already have an account?" : "New to PixScribe?"}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-medium text-bright underline-offset-4 transition-colors hover:text-iris-soft hover:underline"
        >
          {isSignup ? "Sign in" : "Create one free"}
        </Link>
      </p>
    </div>
  );
}
