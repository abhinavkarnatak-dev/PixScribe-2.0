"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, Globe, Lock, Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { STYLE_PRESETS } from "@/config/presets";
import type { GenerationView } from "@/server/services/generation.service";
import { cn, relativeTime } from "@/lib/utils";

function presetLabel(id: string): string | null {
  const preset = STYLE_PRESETS.find((item) => item.id === id);
  return preset && preset.id !== "none" ? preset.label : null;
}

export function downloadGeneration(item: GenerationView) {
  const name = item.prompt.slice(0, 40).replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  window.location.href = `/api/download?url=${encodeURIComponent(
    item.imageUrl,
  )}&name=${encodeURIComponent(name || "pixscribe")}`;
}

/**
 * Masonry-ish grid of generations.
 *
 * `owned` switches on the management affordances - the Explore feed reuses this
 * component read-only, so there is one grid implementation, not two.
 */
export function ImageGrid({
  items,
  owned = false,
  onTogglePublic,
  onDelete,
  busyId,
}: {
  items: GenerationView[];
  owned?: boolean;
  onTogglePublic?: (item: GenerationView) => void;
  onDelete?: (item: GenerationView) => void;
  busyId?: string | null;
}) {
  const [active, setActive] = useState<GenerationView | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.button
              key={item.id}
              layout
              type="button"
              onClick={() => setActive(item)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{
                duration: 0.45,
                // Cap the stagger so a full page does not cascade forever.
                delay: Math.min(index, 8) * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-[var(--line)] bg-surface text-left"
            >
              <Image
                src={item.thumbnailUrl}
                alt={item.prompt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
              />

              <span className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <span className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <span className="line-clamp-2 text-[12px] leading-snug text-bright">
                  {item.prompt}
                </span>
              </span>

              {owned && item.isPublic ? (
                <span
                  className="absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-full bg-void/70 backdrop-blur"
                  title="Published to the showcase"
                >
                  <Globe className="size-3 text-mint" aria-hidden />
                </span>
              ) : null}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <Dialog
        open={active !== null}
        onClose={() => setActive(null)}
        title={active?.prompt ?? "Generation"}
        size="full"
        className="p-0"
      >
        {active ? (
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="relative aspect-square bg-void">
              <Image
                src={active.imageUrl}
                alt={active.prompt}
                fill
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-contain"
              />
            </div>

            <div className="flex flex-col gap-5 p-6 sm:p-8">
              <div>
                <p className="eyebrow">Prompt</p>
                <p className="mt-3 font-mono text-[13px] leading-relaxed text-bright">
                  {active.prompt}
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-5 text-[13px]">
                <div>
                  <dt className="text-faint">Style</dt>
                  <dd className="mt-1 text-muted">
                    {presetLabel(active.presetId) ?? "None"}
                  </dd>
                </div>
                <div>
                  <dt className="text-faint">Created</dt>
                  <dd className="mt-1 text-muted">{relativeTime(active.createdAt)}</dd>
                </div>
                {active.width && active.height ? (
                  <div>
                    <dt className="text-faint">Size</dt>
                    <dd className="mt-1 font-mono text-muted">
                      {active.width} x {active.height}
                    </dd>
                  </div>
                ) : null}
                {owned ? (
                  <div>
                    <dt className="text-faint">Visibility</dt>
                    <dd
                      className={cn(
                        "mt-1",
                        active.isPublic ? "text-mint" : "text-muted",
                      )}
                    >
                      {active.isPublic ? "Public" : "Private"}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                <Button size="sm" onClick={() => downloadGeneration(active)}>
                  <Download className="size-4" />
                  Download
                </Button>

                {owned && onTogglePublic ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={busyId === active.id}
                    onClick={() => {
                      onTogglePublic(active);
                      setActive({ ...active, isPublic: !active.isPublic });
                    }}
                  >
                    {active.isPublic ? (
                      <>
                        <Lock className="size-4" />
                        Make private
                      </>
                    ) : (
                      <>
                        <Globe className="size-4" />
                        Publish
                      </>
                    )}
                  </Button>
                ) : null}

                {owned && onDelete ? (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      onDelete(active);
                      setActive(null);
                    }}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}

/** Placeholder tiles shown while the first page loads. */
export function ImageGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="shimmer aspect-square rounded-2xl border border-[var(--line)] bg-surface-2/40"
        />
      ))}
    </div>
  );
}
