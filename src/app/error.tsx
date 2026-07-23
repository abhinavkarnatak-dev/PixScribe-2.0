"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] render error", error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center px-5">
      <div className="max-w-md text-center">
        <p className="font-mono text-sm text-faint">Something broke</p>
        <h1 className="font-display mt-4 text-[clamp(2rem,6vw,3rem)] text-bright">
          That did not go to plan.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          An unexpected error stopped this page from rendering. Trying again
          often works.
        </p>

        {error.digest ? (
          <p className="mt-4 font-mono text-xs text-faint">
            Reference: {error.digest}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>
            <RotateCcw className="size-4" />
            Try again
          </Button>
          <ButtonLink href="/" variant="secondary">
            Back home
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
