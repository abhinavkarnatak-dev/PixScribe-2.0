"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Live checklist of the password rules.
 *
 * Mirrors `passwordSchema` exactly - showing the requirements as they are met
 * beats letting someone submit and be told what they got wrong.
 */
const RULES = [
  { label: "8+ characters", test: (value: string) => value.length >= 8 },
  { label: "Lowercase", test: (value: string) => /[a-z]/.test(value) },
  { label: "Uppercase", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Number", test: (value: string) => /[0-9]/.test(value) },
] as const;

export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;

  const met = RULES.filter((rule) => rule.test(value)).length;
  const ratio = met / RULES.length;

  const tone =
    ratio === 1 ? "bg-mint" : ratio >= 0.5 ? "bg-ember" : "bg-danger";

  return (
    <div className="-mt-1 mb-1">
      <div className="h-1 overflow-hidden rounded-full bg-surface-3">
        <motion.div
          className={cn("h-full rounded-full", tone)}
          initial={false}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
        {RULES.map((rule) => {
          const passed = rule.test(value);
          return (
            <li
              key={rule.label}
              className={cn(
                "flex items-center gap-1 text-[11px] transition-colors duration-200",
                passed ? "text-mint" : "text-faint",
              )}
            >
              <Check
                className={cn(
                  "size-3 transition-opacity duration-200",
                  passed ? "opacity-100" : "opacity-30",
                )}
                aria-hidden
              />
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
