import type { Metadata } from "next";
import { listPublicGenerations } from "@/server/services/generation.service";
import { GalleryView } from "@/components/gallery/gallery-view";
import { AuroraBackdrop } from "@/components/ui/aurora-backdrop";

export const metadata: Metadata = {
  title: "Explore",
  description: "Images the PixScribe community has published.",
};

// The feed changes as people publish, so it is rendered per request.
export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const page = await listPublicGenerations({});

  return (
    <div className="relative">
      <AuroraBackdrop intensity="subtle" />

      <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="max-w-2xl">
          <p className="eyebrow">Showcase</p>
          <h1 className="font-display mt-3 text-[clamp(2rem,5vw,3rem)] text-bright">
            Made by the community.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Images people chose to publish, with the prompts that made them.
            Borrow an idea, or see how a phrasing choice changes the result.
          </p>
        </div>

        <div className="mt-10">
          <GalleryView initialPage={page} mode="explore" />
        </div>
      </div>
    </div>
  );
}
