"use client";

import { motion } from "motion/react";
import { STYLE_PRESETS } from "@/config/presets";
import { cn } from "@/lib/utils";

export function PresetPicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="eyebrow mb-3">Style</legend>

      <div
        role="radiogroup"
        aria-label="Style preset"
        className="flex flex-wrap gap-2"
      >
        {STYLE_PRESETS.map((preset) => {
          const active = preset.id === value;
          return (
            <button
              key={preset.id}
              type="button"
              role="radio"
              aria-checked={active}
              title={preset.hint}
              onClick={() => onChange(preset.id)}
              className={cn(
                "relative inline-flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-[13px] transition-all duration-200 disabled:opacity-40",
                active
                  ? "border-transparent text-bright"
                  : "border-[var(--line)] text-muted hover:border-white/20 hover:text-bright",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="preset-active"
                  className="absolute inset-0 rounded-full bg-white/[0.09] ring-1 ring-white/20"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              ) : null}

              <span
                className="relative size-5 shrink-0 rounded-full ring-1 ring-white/10"
                style={{
                  background: `linear-gradient(135deg, ${preset.swatch[0]}, ${preset.swatch[1]})`,
                }}
                aria-hidden
              />
              <span className="relative whitespace-nowrap">{preset.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
