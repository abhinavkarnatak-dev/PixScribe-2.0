import type { Metadata } from "next";
import { PricingPlans } from "@/components/pricing/pricing-plans";
import { AuroraBackdrop } from "@/components/ui/aurora-backdrop";
import { FREE_SIGNUP_CREDITS } from "@/config/plans";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Buy PixScribe credits outright. No subscription, no expiry, three plans.",
};

const FAQ = [
  {
    q: "Do credits expire?",
    a: "No. Credits stay on your account until you spend them. There is no monthly reset and nothing to cancel.",
  },
  {
    q: "What does one credit get me?",
    a: "One credit generates one image at full resolution. If a generation fails for any reason on our side, the credit is returned to your balance automatically.",
  },
  {
    q: "Can I get a refund?",
    a: `Unused credits can be refunded within ${SITE.refundWindowDays} days of purchase. Credits you have already spent cannot be refunded, since the generation cost has been incurred. See the Refund Policy for the full detail.`,
  },
  {
    q: "Which payment methods work?",
    a: "Razorpay handles the payment, so cards, UPI, net banking, and popular wallets are all supported. We never receive or store your payment details.",
  },
] as const;

export default function PricingPage() {
  return (
    <div className="relative">
      <AuroraBackdrop intensity="subtle" />

      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Pricing</p>
          <h1 className="font-display mt-4 text-[clamp(2.25rem,6vw,4rem)] text-balance-pretty text-bright">
            Buy credits, not a{" "}
            <span className="accent-serif text-aurora">subscription</span>.
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-muted">
            One credit makes one image. Every account starts with{" "}
            {FREE_SIGNUP_CREDITS} free, and the more you buy at once, the less
            each image costs.
          </p>
        </div>

        <div className="mt-16">
          <PricingPlans />
        </div>

        <section className="mx-auto mt-24 max-w-3xl">
          <h2 className="font-display text-3xl text-bright">Common questions</h2>
          <dl className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {FAQ.map((item) => (
              <div key={item.q} className="py-6">
                <dt className="text-[15px] font-medium text-bright">{item.q}</dt>
                <dd className="mt-2.5 text-[15px] leading-relaxed text-muted">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
