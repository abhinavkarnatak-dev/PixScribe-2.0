"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { CreditPill } from "@/components/ui/credit-pill";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/providers/toast-provider";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { changePasswordSchema } from "@/lib/validation/schemas";
import { PasswordStrength } from "@/components/auth/password-strength";
import type { TransactionView } from "@/server/services/payment.service";
import type { PublicUser } from "@/server/services/auth.service";
import { cn, formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

const STATUS_META = {
  paid: { icon: CheckCircle2, label: "Paid", className: "text-mint" },
  created: { icon: Clock, label: "Pending", className: "text-ember" },
  failed: { icon: XCircle, label: "Failed", className: "text-danger" },
  cancelled: { icon: XCircle, label: "Cancelled", className: "text-faint" },
} as const;

export function AccountView({
  user,
  transactions: initialTransactions,
  totalImages,
}: {
  user: PublicUser;
  transactions: TransactionView[];
  totalImages: number;
}) {
  const { user: liveUser, setCredits } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState(initialTransactions);

  const credits = liveUser?.credits ?? user.credits;

  // Same recovery pass the pricing page runs, so a stuck payment resolves
  // wherever the user happens to land first.
  useEffect(() => {
    void apiRequest<{ settled: number; creditsAdded: number }>(
      "/api/payments/reconcile",
      { method: "POST" },
    )
      .then(async (result) => {
        if (result.settled === 0) return;
        setCredits(credits + result.creditsAdded);
        toast({
          tone: "success",
          title: "We found a completed payment",
          description: `${result.creditsAdded} credits have been added.`,
        });
        const data = await apiRequest<{ transactions: TransactionView[] }>(
          "/api/transactions",
        );
        setTransactions(data.transactions);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    { label: "Credits left", value: String(credits) },
    { label: "Images made", value: String(totalImages) },
    { label: "Credits bought", value: String(user.totalCreditsPurchased) },
    { label: "Member since", value: formatDate(user.memberSince) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="panel hairline-top flex flex-wrap items-center justify-between gap-6 p-7">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--color-iris),var(--color-orchid))] font-display text-2xl text-white">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg text-bright">{user.name}</p>
            <p className="truncate text-sm text-muted">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CreditPill credits={credits} />
          <ButtonLink href="/pricing" size="sm">
            Top up
          </ButtonLink>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="panel p-5"
          >
            <p className="text-[11px] uppercase tracking-wider text-faint">
              {stat.label}
            </p>
            <p className="font-display mt-2 text-3xl text-bright">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <TransactionHistory transactions={transactions} />
        <ChangePasswordCard />
      </div>
    </div>
  );
}

function TransactionHistory({ transactions }: { transactions: TransactionView[] }) {
  return (
    <section className="panel p-7 overflow-auto">
      <h2 className="text-lg text-bright">Purchase history</h2>
      <p className="mt-1.5 text-[13px] text-muted">
        Every credit purchase on this account, kept for your records.
      </p>

      {transactions.length === 0 ? (
        <p className="mt-8 text-[15px] text-faint">
          No purchases yet. Your free credits do not appear here.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-wider text-faint">
                <th className="pb-3 pr-4 font-normal">Plan</th>
                <th className="pb-3 pr-4 font-normal">Amount</th>
                <th className="pb-3 pr-4 font-normal">Credits</th>
                <th className="pb-3 pr-4 font-normal">Status</th>
                <th className="pb-3 font-normal">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {transactions.map((item) => {
                const meta = STATUS_META[item.status];
                return (
                  <tr key={item.id}>
                    <td className="py-3.5 pr-4 text-bright">{item.planName}</td>
                    <td className="py-3.5 pr-4 font-mono tabular-nums text-muted">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="py-3.5 pr-4 font-mono tabular-nums text-muted">
                      {item.creditsGranted ? `+${item.credits}` : item.credits}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={cn("inline-flex items-center gap-1.5", meta.className)}
                      >
                        <meta.icon className="size-3.5" aria-hidden />
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-3.5 whitespace-nowrap text-faint">
                      {formatDateTime(item.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ChangePasswordCard() {
  const { toast } = useToast();
  const [values, setValues] = useState({ currentPassword: "", newPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});

    const parsed = changePasswordSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest("/api/auth/change-password", {
        method: "POST",
        body: parsed.data,
      });
      setValues({ currentPassword: "", newPassword: "" });
      toast({ tone: "success", title: "Password updated" });
    } catch (error) {
      if (error instanceof ApiClientError && error.details) {
        const next: Record<string, string> = {};
        for (const [key, messages] of Object.entries(error.details)) {
          next[key] = messages[0] ?? "";
        }
        setErrors(next);
      } else {
        toast({
          tone: "error",
          title: "Could not update password",
          description: error instanceof ApiClientError ? error.message : undefined,
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel p-7">
      <h2 className="text-lg text-bright">Change password</h2>
      <p className="mt-1.5 text-[13px] text-muted">
        You will stay signed in on this device.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-1">
        <Field
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={values.currentPassword}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              currentPassword: event.target.value,
            }))
          }
          error={errors.currentPassword || undefined}
        />

        <Field
          label="New password"
          type="password"
          autoComplete="new-password"
          value={values.newPassword}
          onChange={(event) =>
            setValues((current) => ({ ...current, newPassword: event.target.value }))
          }
          error={errors.newPassword || undefined}
        />

        <PasswordStrength value={values.newPassword} />

        <Button
          type="submit"
          variant="secondary"
          loading={submitting}
          className="mt-4 w-full"
        >
          Update password
        </Button>
      </form>
    </section>
  );
}
