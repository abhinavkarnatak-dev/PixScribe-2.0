"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { FREE_SIGNUP_CREDITS } from "@/config/plans";

export function CtaBand() {
  const { isSignedIn } = useAuth();

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="panel hairline-top relative overflow-hidden px-6 py-16 text-center sm:px-16 sm:py-24"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          >
            <div className="aurora-blob left-[10%] top-[-40%] size-[30vw] bg-iris/50" />
            <div className="aurora-blob right-[5%] bottom-[-45%] size-[26vw] bg-rose/40 [animation-delay:-9s]" />
          </div>

          <h2 className="font-display mx-auto max-w-2xl text-[clamp(2rem,5.5vw,3.5rem)] text-balance-pretty text-bright">
            Your next image is one{" "}
            <span className="accent-serif text-aurora">sentence</span> away.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[17px] leading-relaxed text-muted">
            {isSignedIn
              ? "Your studio is waiting. Pick a style and go."
              : `Sign up and get ${FREE_SIGNUP_CREDITS} credits on the house. No card, no trial timer.`}
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink
              href={isSignedIn ? "/studio" : "/signup"}
              size="lg"
              className="group"
            >
              {isSignedIn ? "Open the studio" : "Create your first image"}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </ButtonLink>
            <ButtonLink href="/pricing" variant="secondary" size="lg">
              View pricing
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
