"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Download, PenLine, Wand2 } from "lucide-react";
import { SHOWCASE_IMAGES } from "@/config/site";
import { STYLE_PRESETS } from "@/config/presets";

const STEPS = [
  {
    icon: PenLine,
    title: "Describe it",
    body: "Write a phrase or a paragraph. The more specific you are about subject, mood, and lighting, the closer the result lands.",
  },
  {
    icon: Wand2,
    title: "Pick a look",
    body: "Layer on a style preset - cinematic, photoreal, anime, 3D - and the prompt is tuned for that look behind the scenes.",
  },
  {
    icon: Download,
    title: "Keep it",
    body: "Download at full resolution, save it to your private gallery, or publish it to the community showcase.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="font-display mt-4 text-[clamp(2rem,5vw,3.25rem)] text-balance-pretty text-bright">
            Three steps, one <span className="accent-serif text-aurora">sentence</span>.
          </h2>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="panel hairline-top group relative overflow-hidden p-7"
            >
              <span
                className="font-mono text-xs text-faint"
                aria-hidden
              >{`0${index + 1}`}</span>

              <span className="mt-5 grid size-11 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--color-iris),var(--color-orchid))] shadow-lg shadow-iris/20">
                <step.icon className="size-5 text-white" aria-hidden />
              </span>

              <h3 className="mt-5 text-lg font-medium text-bright">{step.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-muted">
                {step.body}
              </p>

              {/* Glow that follows the card on hover. */}
              <span className="pointer-events-none absolute -bottom-24 left-1/2 size-48 -translate-x-1/2 rounded-full bg-iris/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Split feature block: art on one side, the preset story on the other. */
export function StyleShowcase() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-3">
              {SHOWCASE_IMAGES.slice(0, 4).map((image, index) => (
                <div
                  key={image.src}
                  className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--line)]"
                  style={{ transform: `translateY(${index % 2 === 0 ? "0" : "22px"})` }}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 1024px) 45vw, 280px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div
              aria-hidden
              className="absolute -inset-8 -z-10 rounded-[40px] bg-[radial-gradient(circle_at_50%_50%,var(--color-iris)/25,transparent_65%)] blur-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="eyebrow">Style presets</p>
            <h2 className="font-display mt-4 text-[clamp(2rem,5vw,3.25rem)] text-balance-pretty text-bright">
              A whole <span className="accent-serif text-aurora">mood</span>, in one tap.
            </h2>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-muted">
              Getting a specific look usually means memorising a paragraph of
              lens, lighting, and render jargon. Presets carry that for you, so
              your prompt can stay about the idea.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {STYLE_PRESETS.filter((preset) => preset.id !== "none").map((preset) => (
                <span
                  key={preset.id}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-surface/60 py-2 pl-2 pr-4 text-[13px] text-muted backdrop-blur transition-colors hover:border-white/20 hover:text-bright"
                >
                  <span
                    className="size-4 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${preset.swatch[0]}, ${preset.swatch[1]})`,
                    }}
                    aria-hidden
                  />
                  {preset.label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
