"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/providers/toast-provider";
import type { PlanId } from "@/config/plans";
import { SITE } from "@/config/site";

const CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (payload: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

/** Loads Checkout on first use rather than on every page view. */
function loadCheckoutScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CHECKOUT_SCRIPT}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("script failed")));
      return;
    }

    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("script failed"));
    document.body.appendChild(script);
  });
}

export interface PurchaseSuccess {
  planName: string;
  creditsAdded: number;
  credits: number;
}

export function useCheckout() {
  const router = useRouter();
  const { user, setCredits } = useAuth();
  const { toast } = useToast();

  const [pendingPlan, setPendingPlan] = useState<PlanId | null>(null);
  const [success, setSuccess] = useState<PurchaseSuccess | null>(null);
  const orderRef = useRef<string | null>(null);

  const clearSuccess = useCallback(() => setSuccess(null), []);

  /** Fire-and-forget bookkeeping when a checkout ends without a payment. */
  const reportAbandon = useCallback(
    (orderId: string, outcome: "cancelled" | "failed", reason?: string) => {
      void apiRequest("/api/payments/abandon", {
        method: "POST",
        body: { orderId, outcome, reason },
      }).catch(() => {});
    },
    [],
  );

  const purchase = useCallback(
    async (planId: PlanId) => {
      if (!user) {
        router.push("/login?next=/pricing");
        return;
      }

      setPendingPlan(planId);

      try {
        await loadCheckoutScript();

        const { order } = await apiRequest<{
          order: {
            orderId: string;
            amount: number;
            currency: string;
            planName: string;
            credits: number;
          };
        }>("/api/payments/order", { method: "POST", body: { planId } });

        orderRef.current = order.orderId;

        const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!keyId) throw new Error("Razorpay key is not configured");
        if (!window.Razorpay) throw new Error("Razorpay did not load");

        const checkout = new window.Razorpay({
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: SITE.name,
          description: `${order.planName} - ${order.credits} credits`,
          order_id: order.orderId,
          prefill: { name: user.name, email: user.email },
          theme: { color: "#6d5cff" },
          notes: { plan: order.planName },
          // Nothing here is trusted. The handler payload is re-verified by HMAC
          // on the server before a single credit is granted.
          handler: async (response: RazorpayResponse) => {
            try {
              const result = await apiRequest<{
                credits: number | null;
                creditsAdded: number;
                planName: string;
                newlyGranted: boolean;
              }>("/api/payments/verify", { method: "POST", body: response });

              if (result.credits !== null) setCredits(result.credits);

              setSuccess({
                planName: result.planName,
                creditsAdded: result.creditsAdded,
                credits: result.credits ?? user.credits,
              });

              router.refresh();
            } catch (error) {
              toast({
                tone: "error",
                title: "We could not confirm that payment",
                description:
                  error instanceof ApiClientError
                    ? error.message
                    : `If money left your account, email ${SITE.supportEmail} and we will sort it out.`,
              });
            } finally {
              setPendingPlan(null);
            }
          },
          modal: {
            ondismiss: () => {
              setPendingPlan(null);
              if (orderRef.current) {
                reportAbandon(orderRef.current, "cancelled");
              }
              toast({
                tone: "info",
                title: "Checkout cancelled",
                description: "No payment was taken. You can try again any time.",
              });
            },
          },
        });

        checkout.on("payment.failed", (payload: unknown) => {
          const description =
            (payload as { error?: { description?: string } })?.error?.description ??
            "The payment could not be completed.";

          if (orderRef.current) {
            reportAbandon(orderRef.current, "failed", description);
          }
          setPendingPlan(null);
          toast({
            tone: "error",
            title: "Payment failed",
            description: `${description} No credits were added and you can retry.`,
          });
        });

        checkout.open();
      } catch (error) {
        setPendingPlan(null);
        toast({
          tone: "error",
          title: "Could not start checkout",
          description:
            error instanceof ApiClientError
              ? error.message
              : "Check your connection and try again.",
        });
      }
    },
    [user, router, setCredits, toast, reportAbandon],
  );

  return { purchase, pendingPlan, success, clearSuccess };
}
