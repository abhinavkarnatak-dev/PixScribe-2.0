"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, PartyPopper, ShieldCheck } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useCheckout } from "@/components/pricing/use-checkout";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/providers/toast-provider";
import { apiRequest } from "@/lib/api-client";
import { FREE_SIGNUP_CREDITS, PLANS, pricePerImage } from "@/config/plans";
import { formatCurrency, cn } from "@/lib/utils";

export function PricingPlans() {
  const { isSignedIn, user, setCredits } = useAuth();
  const { purchase, pendingPlan, success, clearSuccess } = useCheckout();
  const { toast } = useToast();

  // Recover any payment that completed without reaching us - a closed tab, a
  // dropped connection, or simply no webhook configured.
  useEffect(() => {
    if (!isSignedIn) return;

    void apiRequest<{ settled: number; creditsAdded: number }>(
      "/api/payments/reconcile",
      { method: "POST" },
    )
      .then((result) => {
        if (result.settled > 0) {
          setCredits((user?.credits ?? 0) + result.creditsAdded);
          toast({
            tone: "success",
            title: "We found a completed payment",
            description: `${result.creditsAdded} credits have been added to your account.`,
          });
        }
      })
      .catch(() => {});
    // Runs once per mount; deliberately not re-running as credits change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  const cheapest = Math.min(...PLANS.map((plan) => pricePerImage(plan)));

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan, index) => {
          const perImage = pricePerImage(plan);
          const isBest = perImage === cheapest;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={cn(
                "panel hairline-top relative flex flex-col p-7",
                plan.highlight && "ring-aurora lg:-my-3 lg:py-10",
              )}
            >
              {plan.highlight ? (
                <span className="absolute -top-3 left-7 rounded-full bg-[linear-gradient(100deg,var(--color-iris),var(--color-orchid))] px-3 py-1 text-[11px] font-medium text-white">
                  Most popular
                </span>
              ) : null}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-medium text-bright">{plan.name}</h3>
                  <p className="mt-1 text-[13px] text-faint">{plan.tagline}</p>
                </div>
                {isBest ? (
                  <span className="rounded-full border border-mint/30 bg-mint/10 px-2.5 py-1 text-[11px] text-mint">
                    Best value
                  </span>
                ) : null}
              </div>

              <p className="mt-7 flex items-baseline gap-2">
                <span className="font-display text-5xl text-bright">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-[13px] text-faint">one time</span>
              </p>

              <p className="mt-3 text-sm">
                <span className="text-bright">{plan.credits} credits</span>
                <span className="text-faint">
                  {" "}
                  &middot; {formatCurrency(Number(perImage.toFixed(2)))} an image
                </span>
              </p>

              <ul className="mt-7 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-muted"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-mint" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {isSignedIn ? (
                  <Button
                    className="w-full"
                    size="lg"
                    variant={plan.highlight ? "primary" : "secondary"}
                    loading={pendingPlan === plan.id}
                    disabled={pendingPlan !== null && pendingPlan !== plan.id}
                    onClick={() => void purchase(plan.id)}
                  >
                    {pendingPlan === plan.id ? "Opening checkout" : "Buy credits"}
                  </Button>
                ) : (
                  <ButtonLink
                    href="/signup"
                    className="w-full"
                    size="lg"
                    variant={plan.highlight ? "primary" : "secondary"}
                  >
                    Sign up to buy
                  </ButtonLink>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Trust and legal block, deliberately adjacent to the buy buttons. */}
      <div className="panel mt-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-mint" aria-hidden />
          <div>
            <p className="text-sm text-bright">
              Payments are processed by Razorpay. We never see your card details.
            </p>
            <p className="mt-1 text-[13px] text-muted">
              Credits are added the moment payment is confirmed and never expire.
              New accounts start with {FREE_SIGNUP_CREDITS} free.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] sm:shrink-0">
          <Link href="/terms" className="text-muted underline-offset-4 hover:text-bright hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="text-muted underline-offset-4 hover:text-bright hover:underline">
            Privacy
          </Link>
          <Link href="/refunds" className="text-muted underline-offset-4 hover:text-bright hover:underline">
            Refund Policy
          </Link>
        </div>
      </div>

      <Dialog
        open={success !== null}
        onClose={clearSuccess}
        title="Payment successful"
        size="md"
      >
        {success ? (
          <div className="flex flex-col items-center p-8 text-center">
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="grid size-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--color-iris),var(--color-orchid),var(--color-rose))] shadow-xl shadow-iris/30"
            >
              <PartyPopper className="size-7 text-white" aria-hidden />
            </motion.span>

            <h2 className="font-display mt-6 text-3xl text-bright">
              You are topped up
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              <span className="text-bright">
                {success.creditsAdded} credits
              </span>{" "}
              from the {success.planName} plan have been added. Your balance is
              now <span className="text-bright">{success.credits}</span>.
            </p>

            <div className="mt-8 flex w-full flex-col gap-2 sm:flex-row">
              <ButtonLink href="/studio" className="flex-1" size="lg">
                Start creating
              </ButtonLink>
              <Button variant="secondary" size="lg" onClick={clearSuccess} className="flex-1">
                Stay here
              </Button>
            </div>

            <Link
              href="/account"
              className="mt-5 text-[13px] text-faint underline-offset-4 hover:text-muted hover:underline"
            >
              View your receipt
            </Link>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
