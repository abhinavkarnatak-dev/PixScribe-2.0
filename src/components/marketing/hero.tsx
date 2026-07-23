"use client";

import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { AuroraBackdrop } from "@/components/ui/aurora-backdrop";
import { ShowcaseMarquee } from "@/components/marketing/showcase-marquee";
import { useAuth } from "@/components/providers/auth-provider";
import { FREE_SIGNUP_CREDITS } from "@/config/plans";

/** Staggered reveal - each element enters slightly after the one above it. */
const rise = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function Hero() {
  const { isSignedIn } = useAuth();

  return (
    <section className="relative overflow-hidden pt-16 sm:pt-24">
      <AuroraBackdrop />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-center text-center">
          <motion.div
            variants={rise}
            initial="hidden"
            animate="show"
            custom={0}
            className="ring-aurora inline-flex items-center gap-2 rounded-full bg-surface/70 px-4 py-1.5 backdrop-blur"
          >
            <Sparkles className="size-3.5 text-ember" aria-hidden />
            <span className="text-[13px] text-muted">
              {FREE_SIGNUP_CREDITS} free credits, no card required
            </span>
          </motion.div>

          <motion.h1
            variants={rise}
            initial="hidden"
            animate="show"
            custom={0.1}
            className="font-display mt-7 max-w-4xl text-[clamp(2.75rem,8vw,5.5rem)] text-balance-pretty text-bright"
          >
            Type your vision,
            <br />
            see it in <span className="accent-serif text-aurora">seconds</span>.
          </motion.h1>

          <motion.p
            variants={rise}
            initial="hidden"
            animate="show"
            custom={0.2}
            className="mt-6 max-w-xl text-balance-pretty text-[17px] leading-relaxed text-muted"
          >
            Describe anything in plain words. PixScribe turns it into a
            high-resolution image you can download, keep, and share, in about the
            time it takes to read this sentence.
          </motion.p>

          <motion.div
            variants={rise}
            initial="hidden"
            animate="show"
            custom={0.3}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          >
            <ButtonLink href={isSignedIn ? "/studio" : "/signup"} size="lg" className="group">
              {isSignedIn ? "Open the studio" : "Start creating free"}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </ButtonLink>
            <ButtonLink href="/explore" variant="secondary" size="lg">
              See what people made
            </ButtonLink>
          </motion.div>
        </div>
      </div>

      <motion.div
        variants={rise}
        initial="hidden"
        animate="show"
        custom={0.45}
        className="mt-16 sm:mt-20"
      >
        <ShowcaseMarquee rows={1} />
        <p className="mt-5 text-center text-xs text-faint">
          Every image above was generated with PixScribe
        </p>
      </motion.div>
    </section>
  );
}
