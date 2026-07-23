import { ButtonLink } from "@/components/ui/button";
import { AuroraBackdrop } from "@/components/ui/aurora-backdrop";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <div className="relative grid min-h-dvh place-items-center px-5">
      <AuroraBackdrop intensity="subtle" />

      <div className="absolute left-5 top-6 sm:left-8">
        <Logo />
      </div>

      <div className="max-w-md text-center">
        <p className="font-mono text-sm text-faint">404</p>
        <h1 className="font-display mt-4 text-[clamp(2.5rem,8vw,4rem)] text-bright">
          Nothing here.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          This page does not exist, or it moved. The studio is still where you
          left it.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/">Back home</ButtonLink>
          <ButtonLink href="/studio" variant="secondary">
            Go to studio
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
