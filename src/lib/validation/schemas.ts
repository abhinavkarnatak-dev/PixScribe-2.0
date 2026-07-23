import { z } from "zod";
import { STYLE_PRESETS } from "@/config/presets";
import { PLANS } from "@/config/plans";

/** Shared between the client forms and the route handlers, so rules cannot drift. */

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("That does not look like a valid email.")
  .max(254, "That email is too long.")
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "That password is too long.")
  .regex(/[a-z]/, "Include at least one lowercase letter.")
  .regex(/[A-Z]/, "Include at least one uppercase letter.")
  .regex(/[0-9]/, "Include at least one number.");

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tell us your name.")
    .max(60, "That name is too long."),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  // Login deliberately does not re-apply the strength rules - an existing
  // account may predate them, and echoing the rules here leaks policy detail.
  password: z.string().min(1, "Enter your password."),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Choose a password different from your current one.",
    path: ["newPassword"],
  });

const presetIds = STYLE_PRESETS.map((preset) => preset.id) as [string, ...string[]];

/** Blocks the obvious abuse categories before a credit is ever spent. */
const BLOCKED_PROMPT_PATTERNS: readonly RegExp[] = [
  /\bchild(?:ren)?\s+(?:porn|sexual|nude|naked)/i,
  /\b(?:csam|cp)\b.*\b(?:porn|sexual)/i,
  /\bnude\s+(?:child|kid|minor|toddler|infant)/i,
  /\b(?:minor|underage)\s+(?:nude|naked|sexual|porn)/i,
];

export const promptSchema = z
  .string()
  .trim()
  .min(3, "Describe what you want to see, in a few words at least.")
  .max(1000, "Keep prompts under 1000 characters.")
  .refine(
    (value) => !BLOCKED_PROMPT_PATTERNS.some((pattern) => pattern.test(value)),
    "That prompt violates our acceptable use policy.",
  );

export const generateSchema = z.object({
  prompt: promptSchema,
  presetId: z.enum(presetIds).optional(),
});

const planIds = PLANS.map((plan) => plan.id) as [string, ...string[]];

export const createOrderSchema = z.object({
  planId: z.enum(planIds),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const visibilitySchema = z.object({
  isPublic: z.boolean(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GenerateInput = z.infer<typeof generateSchema>;

/** Flattens a Zod error into the `{ field: [messages] }` shape AppError carries. */
export function fieldErrors(error: z.ZodError): Record<string, string[]> {
  const flattened: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    (flattened[key] ??= []).push(issue.message);
  }
  return flattened;
}
