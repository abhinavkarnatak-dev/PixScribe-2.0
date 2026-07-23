"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { CreditPill } from "@/components/ui/credit-pill";
import { AuroraBackdrop } from "@/components/ui/aurora-backdrop";
import { PresetPicker } from "@/components/studio/preset-picker";
import { ResultCanvas } from "@/components/studio/result-canvas";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/providers/toast-provider";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { promptSchema } from "@/lib/validation/schemas";
import { DEFAULT_PRESET_ID } from "@/config/presets";
import type { GenerationView } from "@/server/services/generation.service";
import { cn } from "@/lib/utils";

const PROMPT_MAX = 1000;

const IDEAS = [
  "A lighthouse made of stacked books during a storm at dusk",
  "An astronaut tending a greenhouse on a red desert plateau",
  "A vintage race car parked outside a neon ramen bar in the rain",
  "A snow leopard curled asleep on a marble staircase",
  "A paper crane the size of a building over a sleeping city",
];

export function StudioWorkspace({ initialCredits }: { initialCredits: number }) {
  const router = useRouter();
  const { user, setCredits } = useAuth();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [prompt, setPrompt] = useState("");
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID);
  const [generation, setGeneration] = useState<GenerationView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"visibility" | "delete" | null>(null);

  const credits = user?.credits ?? initialCredits;
  const outOfCredits = credits <= 0;
  const overLimit = prompt.length > PROMPT_MAX;

  const generate = useCallback(async () => {
    setError(null);

    const parsed = promptSchema.safeParse(prompt);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your prompt.");
      textareaRef.current?.focus();
      return;
    }

    if (outOfCredits) {
      setError("You are out of credits. Top up to keep generating.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest<{
        generation: GenerationView;
        credits: number;
      }>("/api/generate", {
        method: "POST",
        body: { prompt: parsed.data, presetId },
      });

      setGeneration(data.generation);
      setCredits(data.credits);

      if (data.credits === 0) {
        toast({
          tone: "info",
          title: "That was your last credit",
          description: "Top up whenever you are ready to make more.",
        });
      }
    } catch (caught) {
      if (caught instanceof ApiClientError) {
        setError(caught.message);

        // Out of credits is the one failure worth interrupting for, since the
        // fix lives on another page.
        if (caught.code === "INSUFFICIENT_CREDITS") {
          setCredits(0);
          toast({
            tone: "error",
            title: "Out of credits",
            description: "Head to pricing to top up.",
          });
        } else if (caught.code === "RATE_LIMITED") {
          toast({ tone: "error", title: "Slow down a moment", description: caught.message });
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [prompt, presetId, outOfCredits, setCredits, toast]);

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Cmd/Ctrl+Enter submits, matching the convention in every other tool.
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      if (!loading) void generate();
    }
  }

  const download = useCallback((item: GenerationView) => {
    const name = item.prompt.slice(0, 40).replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
    // Routed through our own origin so the attachment header actually applies.
    window.location.href = `/api/download?url=${encodeURIComponent(
      item.imageUrl,
    )}&name=${encodeURIComponent(name || "pixscribe")}`;
  }, []);

  const togglePublic = useCallback(
    async (item: GenerationView) => {
      setBusyAction("visibility");
      try {
        const data = await apiRequest<{ generation: GenerationView }>(
          `/api/generations/${item.id}`,
          { method: "PATCH", body: { isPublic: !item.isPublic } },
        );
        setGeneration(data.generation);
        toast({
          tone: "success",
          title: data.generation.isPublic
            ? "Published to the showcase"
            : "Made private again",
          description: data.generation.isPublic
            ? "Anyone can see this on the Explore page now."
            : undefined,
        });
      } catch (caught) {
        toast({
          tone: "error",
          title: "Could not update visibility",
          description:
            caught instanceof ApiClientError ? caught.message : undefined,
        });
      } finally {
        setBusyAction(null);
      }
    },
    [toast],
  );

  const remove = useCallback(
    async (item: GenerationView) => {
      setBusyAction("delete");
      try {
        await apiRequest(`/api/generations/${item.id}`, { method: "DELETE" });
        setGeneration(null);
        toast({ tone: "success", title: "Image deleted" });
        router.refresh();
      } catch (caught) {
        toast({
          tone: "error",
          title: "Could not delete that image",
          description:
            caught instanceof ApiClientError ? caught.message : undefined,
        });
      } finally {
        setBusyAction(null);
      }
    },
    [toast, router],
  );

  return (
    <div className="relative">
      <AuroraBackdrop intensity="subtle" />

      <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Studio</p>
            <h1 className="font-display mt-3 text-[clamp(2rem,5vw,3rem)] text-bright">
              What are we making?
            </h1>
          </div>
          <CreditPill credits={credits} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-10">
          {/* Composer */}
          <div className="flex flex-col gap-6">
            <div className="panel hairline-top p-5 sm:p-6">
              <label htmlFor="prompt" className="eyebrow mb-3 block">
                Prompt
              </label>

              <textarea
                ref={textareaRef}
                id="prompt"
                value={prompt}
                onChange={(event) => {
                  setPrompt(event.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={onKeyDown}
                disabled={loading}
                rows={5}
                placeholder="A weathered brass diving helmet resting on wet sand at low tide, cold morning light..."
                aria-invalid={Boolean(error) || overLimit}
                aria-describedby="prompt-meta"
                className={cn(
                  "w-full resize-none rounded-xl border bg-void/40 p-4 font-mono text-[14px] leading-relaxed text-bright outline-none transition-all duration-200",
                  "placeholder:text-faint/60",
                  "focus:border-iris/60 focus:ring-4 focus:ring-iris/12",
                  "disabled:opacity-60",
                  error || overLimit ? "border-danger/60" : "border-[var(--line)]",
                )}
              />

              <div
                id="prompt-meta"
                className="mt-2 flex items-center justify-between gap-4"
              >
                <span className="text-[11px] text-faint">
                  <kbd className="rounded border border-[var(--line)] px-1 py-0.5 font-mono">
                    {"Ctrl"}
                  </kbd>{" "}
                  +{" "}
                  <kbd className="rounded border border-[var(--line)] px-1 py-0.5 font-mono">
                    Enter
                  </kbd>{" "}
                  to generate
                </span>
                <span
                  className={cn(
                    "font-mono text-[11px] tabular-nums",
                    overLimit ? "text-danger" : "text-faint",
                  )}
                >
                  {prompt.length}/{PROMPT_MAX}
                </span>
              </div>

              <div className="mt-6">
                <PresetPicker
                  value={presetId}
                  onChange={setPresetId}
                  disabled={loading}
                />
              </div>

              <AnimatePresence initial={false}>
                {error ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.2 }}
                    role="alert"
                    className="flex items-start gap-2.5 overflow-hidden rounded-xl border border-danger/30 bg-danger/10 p-3.5"
                  >
                    <AlertTriangle
                      className="mt-0.5 size-4 shrink-0 text-danger"
                      aria-hidden
                    />
                    <p className="flex-1 text-[13px] leading-relaxed text-danger">
                      {error}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {outOfCredits ? (
                  <ButtonLink href="/pricing" size="lg" className="group">
                    Top up credits
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </ButtonLink>
                ) : (
                  <Button
                    size="lg"
                    loading={loading}
                    disabled={!prompt.trim() || overLimit}
                    onClick={() => void generate()}
                  >
                    {loading ? "Generating" : "Generate"}
                    {!loading ? <Sparkles className="size-4" aria-hidden /> : null}
                  </Button>
                )}
                <span className="text-[13px] text-faint">
                  {outOfCredits ? "No credits left" : "Costs 1 credit"}
                </span>
              </div>
            </div>

            {/* Prompt starters, only while the canvas is still empty. */}
            {!generation && !loading ? (
              <div className="panel p-5 sm:p-6">
                <p className="eyebrow mb-3">Need a starting point?</p>
                <div className="flex flex-col gap-1.5">
                  {IDEAS.map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => {
                        setPrompt(idea);
                        textareaRef.current?.focus();
                      }}
                      className="rounded-lg px-3 py-2 text-left text-[13px] leading-relaxed text-muted transition-colors hover:bg-white/5 hover:text-bright"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Canvas */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ResultCanvas
              generation={generation}
              loading={loading}
              busyAction={busyAction}
              onRegenerate={() => {
                setGeneration(null);
                textareaRef.current?.focus();
              }}
              onDownload={download}
              onTogglePublic={(item) => void togglePublic(item)}
              onDelete={(item) => void remove(item)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
