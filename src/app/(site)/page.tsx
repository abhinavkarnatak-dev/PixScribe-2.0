import { Hero } from "@/components/marketing/hero";
import { HowItWorks, StyleShowcase } from "@/components/marketing/how-it-works";
import { CtaBand } from "@/components/marketing/cta-band";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <StyleShowcase />
      <PricingTeaser />
      <CtaBand />
    </>
  );
}
