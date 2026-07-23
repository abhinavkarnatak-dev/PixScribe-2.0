import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/legal-shell";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "When PixScribe credit purchases can be refunded, how to request one, and how long it takes.",
};

export default function RefundsPage() {
  return (
    <LegalShell
      title="Refund Policy"
      summary={`Unspent credits are refundable within ${SITE.refundWindowDays} days. Spent credits are not, because the generation has already been delivered.`}
      current="/refunds"
    >
      <h2>The short version</h2>
      <ul>
        <li>
          <strong>Unspent credits</strong> - refundable within{" "}
          {SITE.refundWindowDays} days of purchase, no reason needed.
        </li>
        <li>
          <strong>Spent credits</strong> - not refundable, because the image was
          generated and the cost incurred.
        </li>
        <li>
          <strong>Failed generations</strong> - never charged. The credit returns
          to your balance automatically, so there is nothing to refund.
        </li>
        <li>
          <strong>Charged but no credits</strong> - always made right, with no
          time limit.
        </li>
      </ul>

      <h2>1. Unspent credits</h2>
      <p>
        If you bought a credit pack within the last {SITE.refundWindowDays} days
        and have not used all of it, you can request a refund of the credits you
        have not spent. We refund pro rata: the unspent portion of the pack at
        the price you actually paid per credit.
      </p>
      <p>
        For example, if you bought 75 credits for {"₹"}199 and have used 15,
        the 60 unspent credits refund at roughly {"₹"}159. The refunded
        credits are removed from your balance when the refund is issued.
      </p>

      <h2>2. Spent credits</h2>
      <p>
        Once a credit produces an image, it is not refundable. Each generation
        costs us a call to a paid third-party API, and that cost is incurred the
        moment you press generate.
      </p>
      <p>
        This includes images you are not happy with. Image generation is
        probabilistic, and a result that does not match what you pictured is a
        delivered service, not a defect. This is exactly why every new account
        gets free credits: try the service before you buy.
      </p>

      <h2>3. Generations that failed</h2>
      <p>
        If a generation fails - our provider errors, times out, refuses the
        prompt, or the image cannot be saved - the credit is returned to your
        balance automatically as part of the same request. You do not need to
        contact us and there is nothing to refund.
      </p>
      <p>
        If you ever see a credit disappear without an image appearing in your
        gallery, that is a bug. Tell us and we will restore it.
      </p>

      <h2>4. You were charged but got no credits</h2>
      <p>
        If money left your account and your balance did not go up, we will always
        fix it, regardless of how long ago it happened.
      </p>
      <p>
        In most cases it fixes itself. We reconcile pending payments against
        Razorpay automatically, so if a payment succeeded but the confirmation
        never reached us - a closed tab, a dropped connection - the credits are
        granted the next time you open the pricing or account page. Every
        purchase is recorded, so nothing is lost.
      </p>
      <p>
        If it has not resolved within a few hours, email us with the payment
        reference from your bank or your Razorpay receipt and we will either
        grant the credits or refund the payment, whichever you prefer.
      </p>

      <h2>5. Duplicate payments</h2>
      <p>
        If you were charged twice for the same purchase, the duplicate is
        refunded in full. Our system is built to grant credits only once per
        order, so a genuine duplicate charge means a duplicate order, and you
        should not pay for both.
      </p>

      <h2>6. Terminated accounts</h2>
      <p>
        If we terminate an account for breaching the acceptable use section of
        our <a href="/terms">Terms &amp; Conditions</a>, unspent credits are
        forfeited and no refund is due. This is not a routine outcome; it applies
        to serious breaches.
      </p>
      <p>
        If you close your account yourself, the standard {SITE.refundWindowDays}
        -day rule applies to unspent credits from any purchase in that window.
      </p>

      <h2>7. How to request a refund</h2>
      <p>
        Email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>{" "}
        from the address on your account, and include:
      </p>
      <ul>
        <li>The plan you bought and roughly when</li>
        <li>
          The payment or order reference, which is on your account page under
          purchase history
        </li>
        <li>Whether you want a refund or the credits granted</li>
      </ul>
      <p>
        We aim to respond within two business days. Approved refunds are issued
        to the original payment method through Razorpay. Once we issue it,
        Razorpay and your bank typically take five to seven business days to make
        the money visible in your account - that part is outside our control.
      </p>

      <h2>8. Statutory rights</h2>
      <p>
        This policy sits alongside your rights under Indian consumer law and does
        not replace them. Where the law gives you a stronger right than this
        policy does, the law wins.
      </p>
    </LegalShell>
  );
}
