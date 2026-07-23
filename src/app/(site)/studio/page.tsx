import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { getBalance } from "@/server/services/credit.service";
import { StudioWorkspace } from "@/components/studio/studio-workspace";

export const metadata: Metadata = {
  title: "Studio",
  description: "Turn a prompt into an image.",
};

export default async function StudioPage() {
  // The proxy already redirected signed-out users; this is the authoritative
  // check that does not trust that layer.
  const session = await readSession();
  if (!session) redirect("/login?next=/studio");

  const credits = await getBalance(session.userId).catch(() => 0);

  return <StudioWorkspace initialCredits={credits} />;
}
