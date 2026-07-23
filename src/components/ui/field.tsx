"use client";

import { forwardRef, useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  label: string;
  /** First message wins; the rest are still announced by the live region. */
  error?: string;
  hint?: string;
  className?: string;
}

/**
 * Labelled text input with inline validation.
 *
 * The error is wired to the input through `aria-describedby` and
 * `aria-invalid`, and lives in a polite live region so screen readers announce
 * it when it appears rather than only on focus.
 */
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, hint, className, type = "text", ...props },
  ref,
) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === "password";
  const resolvedType = isPassword && revealed ? "text" : type;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className="text-[13px] font-medium text-muted transition-colors"
      >
        {label}
      </label>

      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={resolvedType}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 w-full rounded-xl border bg-surface/60 px-4 text-[15px] text-bright outline-none transition-all duration-200",
            "placeholder:text-faint/70",
            "focus:border-iris/60 focus:bg-surface-2/80 focus:ring-4 focus:ring-iris/12",
            isPassword && "pr-12",
            error
              ? "border-danger/60 focus:border-danger focus:ring-danger/12"
              : "border-[var(--line)]",
          )}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-faint transition-colors hover:text-bright"
            // Keep focus on the input so toggling never interrupts typing flow.
            tabIndex={-1}
          >
            {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </div>

      <div className="min-h-[18px]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {error ? (
            <motion.p
              key="error"
              id={`${id}-error`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="text-xs text-danger"
            >
              {error}
            </motion.p>
          ) : hint ? (
            <p key="hint" id={`${id}-hint`} className="text-xs text-faint">
              {hint}
            </p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
});
