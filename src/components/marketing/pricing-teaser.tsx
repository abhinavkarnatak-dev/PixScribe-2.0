"use client";

import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { FREE_SIGNUP_CREDITS, PLANS, pricePerImage } from "@/config/plans";
import { formatCurrency } from "@/lib/utils";

export function PricingTeaser() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="eyebrow">Pricing</p>
            <h2 className="font-display mt-4 text-[clamp(2rem,5vw,3.25rem)] text-balance-pretty text-bright">
              Pay for images, not a{" "}
              <span className="accent-serif text-aurora">subscription</span>.
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-muted">
              Credits never expire and there is nothing to cancel. Start with{" "}
              {FREE_SIGNUP_CREDITS} free, top up when you need more.
            </p>
          </div>
          <ButtonLink href="/pricing" variant="secondary" className="group shrink-0">
            Compare plans
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </ButtonLink>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`panel hairline-top relative p-7 ${
                plan.highlight ? "ring-aurora" : ""
              }`}
            >
              {plan.highlight ? (
                <span className="absolute -top-3 left-7 rounded-full bg-[linear-gradient(100deg,var(--color-iris),var(--color-orchid))] px-3 py-1 text-[11px] font-medium text-white">
                  Most popular
                </span>
              ) : null}

              <h3 className="text-sm font-medium text-muted">{plan.name}</h3>

              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-5xl text-bright">
                  {formatCurrency(plan.price)}
                </span>
              </p>

              <p className="mt-2 text-sm text-muted">
                <span className="text-bright">{plan.credits} credits</span>
                <span className="text-faint">
                  {" "}
                  &middot; {formatCurrency(Number(pricePerImage(plan).toFixed(2)))} an
                  image
                </span>
              </p>

              <ul className="mt-6 flex flex-col gap-2.5">
                {plan.features.slice(0, 4).map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-muted">
                    <Check className="mt-0.5 size-4 shrink-0 text-mint" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
