import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/legal-shell";
import { SITE } from "@/config/site";
import { FREE_SIGNUP_CREDITS } from "@/config/plans";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that govern your use of PixScribe, including account rules, credits, and acceptable use.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms & Conditions"
      summary="These terms govern your use of PixScribe. By creating an account or buying credits, you agree to them."
      current="/terms"
    >
      <h2>1. What PixScribe is</h2>
      <p>
        PixScribe is a text-to-image service. You submit a written prompt, we
        pass it to a third-party image generation provider, and we return the
        resulting image to you and store it in your account gallery. The service
        is provided on an as-is basis.
      </p>
      <p>
        Image generation is probabilistic. The same prompt will not produce the
        same image twice, and we cannot guarantee that any particular prompt will
        produce a result you consider accurate, useful, or aesthetically
        successful. A generation that completes is a delivered service regardless
        of whether you like the output.
      </p>

      <h2>2. Your account</h2>
      <p>
        You must provide a valid email address and keep your password
        confidential. You are responsible for all activity that happens under
        your account, including credits spent. Accounts are for individual use;
        do not share credentials.
      </p>
      <p>
        You must be at least 18 years old, or old enough to enter a binding
        contract where you live and have permission from a parent or guardian.
      </p>

      <h2>3. Credits</h2>
      <p>
        The service runs on credits. <strong>One credit generates one image.</strong>{" "}
        New accounts receive {FREE_SIGNUP_CREDITS} free credits. Additional
        credits can be bought in the packs listed on the pricing page.
      </p>
      <ul>
        <li>
          A credit is deducted when a generation starts, not when it finishes.
        </li>
        <li>
          If a generation fails because of an error on our side or our provider&apos;s
          side, the credit is automatically returned to your balance.
        </li>
        <li>
          Credits do not expire and are not tied to a subscription period.
        </li>
        <li>
          Credits have no cash value, cannot be transferred between accounts, and
          cannot be exchanged for anything other than image generations on this
          service.
        </li>
      </ul>
      <p>
        We apply rate limits to the generation endpoint to keep the service
        available for everyone. Hitting a rate limit does not consume a credit.
      </p>

      <h2>4. Acceptable use</h2>
      <p>
        You are responsible for the prompts you write and the images you
        generate. You may not use PixScribe to create, store, or distribute:
      </p>
      <ul>
        <li>
          Sexual content involving minors, or any content that sexualises a
          person under 18. This is an absolute prohibition and will result in
          immediate, permanent account termination and, where required, a report
          to the relevant authorities.
        </li>
        <li>
          Non-consensual intimate imagery, or sexual content depicting a real,
          identifiable person without their consent.
        </li>
        <li>
          Content that harasses, threatens, defames, or incites violence against
          a person or group.
        </li>
        <li>
          Deceptive imagery presented as a genuine photograph of a real event or
          a real person&apos;s conduct, including fabricated evidence, forged
          documents, and political disinformation.
        </li>
        <li>
          Content that infringes someone else&apos;s copyright, trademark, or
          other intellectual property rights.
        </li>
        <li>
          Content that violates any law that applies to you.
        </li>
      </ul>
      <p>
        We screen prompts for a narrow set of clearly prohibited categories
        before generation, and our upstream provider applies its own filters.
        Neither is comprehensive, and the absence of a block is not our approval
        of what you generated. Enforcement of these rules stays with us.
      </p>
      <p>
        You also may not attempt to circumvent credit accounting, resell access
        to the service, scrape the site, or automate requests beyond ordinary
        interactive use.
      </p>

      <h2>5. Rights in the images you create</h2>
      <p>
        As between you and us, you own the images you generate and may use them
        for personal or commercial purposes. We claim no ownership over your
        output.
      </p>
      <p>
        Two caveats worth understanding. First, the legal status of copyright in
        AI-generated images is unsettled in many jurisdictions, and we make no
        representation that you can register or enforce copyright in an output.
        Second, our upstream provider&apos;s own terms apply to generations made
        through their model, and nothing here grants you rights they have not
        granted us.
      </p>
      <p>
        If you publish an image to the community showcase, you grant us a
        non-exclusive licence to display that image and its prompt publicly on
        the service. You can revoke this at any time by making the image private
        or deleting it.
      </p>

      <h2>6. Availability and change</h2>
      <p>
        We aim to keep PixScribe available but do not promise uninterrupted
        service. We depend on third parties for image generation, image storage,
        and payments, and an outage at any of them will affect us.
      </p>
      <p>
        We may change features, add plans, or adjust prices. Price changes never
        affect credits you have already bought. If we discontinue the service
        entirely, we will give reasonable notice and refund unspent credits
        bought within the preceding twelve months.
      </p>

      <h2>7. Suspension and termination</h2>
      <p>
        We may suspend or terminate an account that breaches these terms,
        particularly the acceptable use section. Where a breach is serious we may
        act without notice.
      </p>
      <p>
        If we terminate your account for a breach, unspent credits are forfeited.
        If you close your account voluntarily, you may request a refund of unspent
        credits under the{" "}
        <a href="/refunds">Refund Policy</a>.
      </p>

      <h2>8. Liability</h2>
      <p>
        To the extent the law allows, our total liability to you for any claim
        relating to the service is limited to the amount you paid us in the
        twelve months before the claim arose. We are not liable for indirect or
        consequential loss, including lost profits, lost data, or loss arising
        from your use of a generated image.
      </p>
      <p>
        Nothing in these terms excludes liability that cannot lawfully be
        excluded.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These terms are governed by the laws of India, and the courts of India
        have exclusive jurisdiction over any dispute arising from them.
      </p>

      <h2>10. Changes to these terms</h2>
      <p>
        We may update these terms. If a change materially affects your rights, we
        will notify account holders by email before it takes effect. Continuing
        to use the service after that point means you accept the updated terms.
      </p>
      <p>
        Questions go to <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
      </p>
    </LegalShell>
  );
}
