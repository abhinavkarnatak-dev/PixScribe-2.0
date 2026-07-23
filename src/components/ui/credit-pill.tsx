"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Credit balance with a change animation.
 *
 * The number rolls vertically when it changes and the pill flashes green on a
 * top-up or amber on a spend, so a balance change is legible without the user
 * having to read the digits.
 */
export function CreditPill({
  credits,
  className,
}: {
  credits: number;
  className?: string;
}) {
  const previous = useRef(credits);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (previous.current === credits) return;
    const direction = credits > previous.current ? "up" : "down";
    previous.current = credits;
    setFlash(direction);
    const timer = window.setTimeout(() => setFlash(null), 900);
    return () => window.clearTimeout(timer);
  }, [credits]);

  const isEmpty = credits <= 0;

  return (
    <motion.span
      animate={
        flash
          ? {
              boxShadow:
                flash === "up"
                  ? "0 0 0 1px rgba(74,222,159,0.5), 0 0 22px rgba(74,222,159,0.28)"
                  : "0 0 0 1px rgba(255,184,107,0.45), 0 0 18px rgba(255,184,107,0.2)",
            }
          : { boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 0 0 rgba(0,0,0,0)" }
      }
      transition={{ duration: 0.35 }}
      className={cn(
        "inline-flex h-9 select-none items-center gap-1.5 rounded-full bg-surface-2/70 px-3 text-sm backdrop-blur",
        className,
      )}
    >
      <Sparkles
        className={cn("size-3.5", isEmpty ? "text-faint" : "text-ember")}
        aria-hidden
      />
      <span className="relative inline-block h-5 w-[3ch] overflow-hidden text-right font-mono tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={credits}
            initial={{ y: flash === "up" ? 16 : -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: flash === "up" ? -16 : 16, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute inset-0 flex items-center justify-end font-medium",
              isEmpty ? "text-faint" : "text-bright",
            )}
          >
            {credits}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="text-xs text-faint">
        {credits === 1 ? "credit" : "credits"}
      </span>
    </motion.span>
  );
}
