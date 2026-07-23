"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, Globe, ImageIcon, Lock, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GenerationView } from "@/server/services/generation.service";
import { cn, truncate } from "@/lib/utils";

/** Rotating status copy so a long wait does not look like a hang. */
const STATUS_LINES = [
  "Reading your prompt",
  "Composing the scene",
  "Painting in detail",
  "Finishing touches",
];

export function ResultCanvas({
  generation,
  loading,
  onRegenerate,
  onDownload,
  onTogglePublic,
  onDelete,
  busyAction,
}: {
  generation: GenerationView | null;
  loading: boolean;
  onRegenerate: () => void;
  onDownload: (generation: GenerationView) => void;
  onTogglePublic: (generation: GenerationView) => void;
  onDelete: (generation: GenerationView) => void;
  busyAction: "visibility" | "delete" | null;
}) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      setStatusIndex(0);
      return;
    }
    const timer = window.setInterval(
      () => setStatusIndex((index) => (index + 1) % STATUS_LINES.length),
      2600,
    );
    return () => window.clearInterval(timer);
  }, [loading]);

  useEffect(() => setImageReady(false), [generation?.id]);

  return (
    <div className="flex flex-col gap-4">
      <div className="panel hairline-top relative aspect-square w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="shimmer absolute inset-0 grid place-items-center bg-surface-2/40"
            >
              <div className="relative z-10 flex flex-col items-center gap-5">
                {/* Two counter-rotating arcs read as "working" without a spinner cliche. */}
                <span className="relative grid size-16 place-items-center">
                  <span className="absolute inset-0 animate-spin-slow rounded-full border-2 border-transparent border-t-iris border-r-orchid" />
                  <span className="absolute inset-2 animate-spin-slow rounded-full border-2 border-transparent border-b-rose [animation-direction:reverse] [animation-duration:1.6s]" />
                  <span className="size-2 rounded-full bg-bright animate-pulse-soft" />
                </span>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={statusIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.35 }}
                    className="font-mono text-xs tracking-wide text-muted"
                  >
                    {STATUS_LINES[statusIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : generation ? (
            <motion.div
              key={generation.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={generation.imageUrl}
                alt={generation.prompt}
                fill
                sizes="(max-width: 1024px) 100vw, 640px"
                priority
                onLoad={() => setImageReady(true)}
                className={cn(
                  "object-cover transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  // Reveal: the finished art resolves out of a blur as it decodes.
                  imageReady
                    ? "scale-100 blur-0 opacity-100"
                    : "scale-105 blur-xl opacity-0",
                )}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 grid place-items-center p-8 text-center"
            >
              <div className="max-w-xs">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-[var(--line)] bg-surface-2/60">
                  <ImageIcon className="size-6 text-faint" aria-hidden />
                </span>
                <p className="mt-5 text-[15px] text-muted">
                  Your image will appear here.
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-faint">
                  Describe a subject, a setting, and a mood. Specific beats
                  clever.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {generation && !loading ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-3"
          >
            <p className="font-mono text-xs leading-relaxed text-faint">
              {truncate(generation.prompt, 180)}
            </p>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onDownload(generation)}>
                <Download className="size-4" />
                Download
              </Button>
              <Button size="sm" variant="secondary" onClick={onRegenerate}>
                <RotateCcw className="size-4" />
                Generate another
              </Button>
              <Button
                size="sm"
                variant="secondary"
                loading={busyAction === "visibility"}
                onClick={() => onTogglePublic(generation)}
              >
                {generation.isPublic ? (
                  <>
                    <Globe className="size-4 text-mint" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="size-4" />
                    Private
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="danger"
                loading={busyAction === "delete"}
                onClick={() => onDelete(generation)}
                aria-label="Delete this image"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
