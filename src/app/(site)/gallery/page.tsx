import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { listUserGenerations } from "@/server/services/generation.service";
import { GalleryView } from "@/components/gallery/gallery-view";
import { AuroraBackdrop } from "@/components/ui/aurora-backdrop";

export const metadata: Metadata = {
  title: "Your gallery",
  description: "Every image you have generated with PixScribe.",
};

export default async function GalleryPage() {
  const session = await readSession();
  if (!session) redirect("/login?next=/gallery");

  const page = await listUserGenerations({ userId: session.userId });

  return (
    <div className="relative">
      <AuroraBackdrop intensity="subtle" />

      <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="max-w-2xl">
          <p className="eyebrow">Your gallery</p>
          <h1 className="font-display mt-3 text-[clamp(2rem,5vw,3rem)] text-bright">
            Everything you have made.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Saved at full resolution and kept indefinitely. Download any of them
            again, publish one to the showcase, or clear out what you do not
            want.
          </p>
        </div>

        <div className="mt-10">
          <GalleryView initialPage={page} mode="mine" />
        </div>
      </div>
    </div>
  );
}
