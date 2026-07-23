import Image from "next/image";
import { Logo } from "@/components/ui/logo";
import { AuroraBackdrop } from "@/components/ui/aurora-backdrop";
import { SHOWCASE_IMAGES } from "@/config/site";
import { FREE_SIGNUP_CREDITS } from "@/config/plans";

/**
 * Split auth layout: form on the left, real generated work on the right.
 *
 * The art panel is hidden below `lg` rather than stacked, so the mobile
 * experience is a focused single-column form with nothing to scroll past.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh">
      <AuroraBackdrop intensity="subtle" />

      <div className="flex w-full flex-col px-5 py-8 sm:px-10 lg:w-[52%] lg:px-16">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-center text-xs text-faint lg:text-left">
          By continuing you agree to our{" "}
          <a href="/terms" className="text-muted underline-offset-4 hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-muted underline-offset-4 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>

      <div className="relative hidden overflow-hidden border-l border-[var(--line)] lg:block lg:w-[48%]">
        <div className="absolute inset-0 grid grid-cols-2 gap-2 p-2">
          {SHOWCASE_IMAGES.slice(0, 6).map((image, index) => (
            <div
              key={image.src}
              className="relative overflow-hidden rounded-xl"
              style={{ transform: `translateY(${index % 2 === 0 ? "-8px" : "8px"})` }}
            >
              <Image
                src={image.src}
                alt=""
                fill
                sizes="30vw"
                className="object-cover"
                priority={index < 2}
              />
            </div>
          ))}
        </div>

        {/* Scrim keeps the copy legible over whatever art sits behind it. */}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/70 to-void/20" />

        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="font-display max-w-sm text-[2.5rem] leading-[1.05] text-bright">
            Made with a{" "}
            <span className="accent-serif text-aurora">sentence</span>.
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Everything here came out of PixScribe. Your first{" "}
            {FREE_SIGNUP_CREDITS} are free.
          </p>
        </div>
      </div>
    </div>
  );
}
