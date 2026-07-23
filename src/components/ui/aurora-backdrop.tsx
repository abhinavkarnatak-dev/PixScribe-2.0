import { cn } from "@/lib/utils";

/**
 * The ambient colour field behind hero and studio surfaces.
 *
 * Purely decorative and pointer-transparent. Uses three heavily blurred blobs
 * animated by CSS transform only, so it stays on the compositor thread and
 * costs nothing on the main thread.
 */
export function AuroraBackdrop({
  className,
  intensity = "full",
}: {
  className?: string;
  intensity?: "full" | "subtle";
}) {
  const opacity = intensity === "full" ? "opacity-70" : "opacity-40";

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "aurora-blob left-[-10%] top-[-20%] size-[52vw] min-size-[320px] bg-iris/45",
          opacity,
        )}
      />
      <div
        className={cn(
          "aurora-blob right-[-8%] top-[-10%] size-[44vw] bg-orchid/35 [animation-delay:-7s]",
          opacity,
        )}
      />
      <div
        className={cn(
          "aurora-blob bottom-[-25%] left-[25%] size-[48vw] bg-rose/25 [animation-delay:-14s]",
          opacity,
        )}
      />
      {/* Fades the field into the page so blobs never end on a hard edge. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_20%,var(--color-void)_78%)]" />
    </div>
  );
}
