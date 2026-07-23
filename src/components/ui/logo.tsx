import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Wordmark. The glyph is a stylised aperture-meets-nib, drawn inline so it
 * inherits currentColor and needs no network request.
 */
export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="PixScribe home"
    >
      <span className="relative grid size-8 place-items-center overflow-hidden rounded-[10px] bg-[linear-gradient(135deg,var(--color-iris),var(--color-orchid)_55%,var(--color-rose))] shadow-lg shadow-iris/25 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-[18px] text-white"
          aria-hidden
        >
          <path
            d="M5 19 19 5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="8.5" cy="8.5" r="2.6" stroke="currentColor" strokeWidth="2" />
          <path
            d="M14.5 14.5 19 19"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      </span>
      <span className="font-display text-[19px] tracking-[-0.04em] text-bright">
        PixScribe
      </span>
    </Link>
  );
}
