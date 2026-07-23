/**
 * Credit plans. Safe to import from client components - contains no secrets.
 *
 * Pricing note: price points from v1 are unchanged, credit allocations were
 * raised so the per-image cost actually falls as you move up a tier
 * (Rs 3.27 -> Rs 2.65 -> Rs 2.00, a 0/19/39 percent discount curve).
 */

export const FREE_SIGNUP_CREDITS = 3;

export type PlanId = "basic" | "advanced" | "business";

export interface Plan {
  id: PlanId;
  name: string;
  /** Price in whole rupees. Converted to paise at order-creation time. */
  price: number;
  credits: number;
  tagline: string;
  features: string[];
  highlight?: boolean;
}

export const PLANS: readonly Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 49,
    credits: 15,
    tagline: "For trying things out",
    features: [
      "15 image generations",
      "All style presets",
      "Full-resolution downloads",
      "Private gallery, kept forever",
    ],
  },
  {
    id: "advanced",
    name: "Advanced",
    price: 199,
    credits: 75,
    tagline: "For regular creative work",
    features: [
      "75 image generations",
      "All style presets",
      "Full-resolution downloads",
      "Private gallery, kept forever",
      "Publish to the community showcase",
    ],
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    price: 499,
    credits: 250,
    tagline: "For high-volume production",
    features: [
      "250 image generations",
      "All style presets",
      "Full-resolution downloads",
      "Private gallery, kept forever",
      "Publish to the community showcase",
      "Priority generation queue",
    ],
  },
] as const;

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((plan) => plan.id === id);
}

/** Per-image cost, used by the pricing page to show the value curve. */
export function pricePerImage(plan: Plan): number {
  return plan.price / plan.credits;
}
