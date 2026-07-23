import Image from "next/image";
import { SHOWCASE_IMAGES } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Infinite marquee of real PixScribe generations.
 *
 * The list is rendered twice and the track translates by exactly -50%, so the
 * loop point lands on an identical frame and reads as seamless. Animation is a
 * single CSS transform, so it stays on the compositor even with large PNGs.
 *
 * Purely decorative: the tiles are not interactive, so the band never competes
 * with the hero's actual call to action.
 */
export function ShowcaseMarquee({
  rows = 2,
  className,
}: {
  rows?: 1 | 2;
  className?: string;
}) {
  // Offset the second row so the two lines never show the same image side by
  // side, and run it the other way for a subtle parallax.
  const lanes =
    rows === 2
      ? [
          { images: SHOWCASE_IMAGES, duration: "68s", reverse: false },
          {
            images: [...SHOWCASE_IMAGES.slice(3), ...SHOWCASE_IMAGES.slice(0, 3)],
            duration: "86s",
            reverse: true,
          },
        ]
      : [{ images: SHOWCASE_IMAGES, duration: "36s", reverse: false }];

  return (
    <div className={cn("relative", className)}>
      {/* Feather the ends so images enter and leave instead of being cut. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-void to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-void to-transparent sm:w-32" />

      <div className="flex flex-col gap-3 sm:gap-4">
        {lanes.map((lane, laneIndex) => (
          <div key={laneIndex} className="marquee-paused overflow-hidden">
            <div
              className="marquee-track gap-3 sm:gap-4"
              style={
                {
                  "--marquee-duration": lane.duration,
                  animationDirection: lane.reverse ? "reverse" : "normal",
                } as React.CSSProperties
              }
            >
              {[...lane.images, ...lane.images].map((image, index) => (
                <div
                  key={`${laneIndex}-${index}`}
                  className={cn(
                    "relative aspect-square shrink-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-surface",
                    // A single lane gets larger tiles so the band still has
                    // presence without a second row under it.
                    rows === 1 ? "w-44 sm:w-60 lg:w-72" : "w-36 sm:w-52 lg:w-60",
                  )}
                >
                  <Image
                    src={image.src}
                    // The band is decorative and the caption below already
                    // explains what it is, so the tiles stay out of the
                    // accessibility tree rather than repeating themselves.
                    alt=""
                    aria-hidden
                    fill
                    sizes={
                      rows === 1
                        ? "(max-width: 640px) 176px, (max-width: 1024px) 240px, 288px"
                        : "(max-width: 640px) 144px, (max-width: 1024px) 208px, 240px"
                    }
                    className="object-cover"
                    priority={laneIndex === 0 && index < 4}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
