import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { getUserById } from "@/server/services/auth.service";
import { listTransactions } from "@/server/services/payment.service";
import { countUserGenerations } from "@/server/services/generation.service";
import { AccountView } from "@/components/account/account-view";
import { AuroraBackdrop } from "@/components/ui/aurora-backdrop";

export const metadata: Metadata = {
  title: "Account",
  description: "Your credits, purchases, and account settings.",
};

export default async function AccountPage() {
  const session = await readSession();
  if (!session) redirect("/login?next=/account");

  const [user, transactions, totalImages] = await Promise.all([
    getUserById(session.userId),
    listTransactions(session.userId),
    countUserGenerations(session.userId),
  ]);

  return (
    <div className="relative">
      <AuroraBackdrop intensity="subtle" />

      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-10">
          <p className="eyebrow">Account</p>
          <h1 className="font-display mt-3 text-[clamp(2rem,5vw,3rem)] text-bright">
            Your account
          </h1>
        </div>

        <AccountView
          user={user}
          transactions={transactions}
          totalImages={totalImages}
        />
      </div>
    </div>
  );
}
