import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/legal-shell";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What data PixScribe collects, why we collect it, who we share it with, and how to get it deleted.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      summary="What we collect, why, who else sees it, and how to get it deleted. No dark patterns and no data sales."
      current="/privacy"
    >
      <h2>1. What we collect</h2>

      <h3>Account data</h3>
      <p>
        Your name, email address, and a password hash. We store a bcrypt hash,
        never the password itself, so we cannot read or recover it - only reset
        it.
      </p>

      <h3>Prompts and generated images</h3>
      <p>
        Every prompt you submit and every image it produces is stored against
        your account so your gallery works. Prompts are stored as you typed
        them. Images are stored with our image hosting provider and referenced
        by URL.
      </p>
      <p>
        We also record which style preset you used, how long the generation took,
        and which of our provider API keys served it. That last field is for
        quota debugging and contains no information about you.
      </p>

      <h3>Payment data</h3>
      <p>
        We store the plan you bought, the amount, the credits granted, the
        payment status, and the Razorpay order and payment identifiers.{" "}
        <strong>
          We never receive, process, or store your card number, CVV, UPI PIN, or
          bank credentials.
        </strong>{" "}
        Those go directly to Razorpay and never touch our servers.
      </p>

      <h3>Technical data</h3>
      <p>
        We use your IP address transiently for rate limiting on signup, login,
        and generation. These counters are short-lived and expire automatically.
      </p>
      <p>
        We use <strong>Vercel Web Analytics</strong> to count page views and see
        which pages people actually use. It is cookieless and does not follow you
        across other websites. It records the page visited plus coarse technical
        details such as country, browser, and device type, all of it aggregated.
        It does not record your name, email, prompts, or images, does not build a
        profile of you, and does not replay your session.
      </p>
      <p>
        We run no advertising trackers and no session recording.
      </p>

      <h2>2. Cookies</h2>
      <p>
        We set exactly one cookie: <strong>pixscribe_session</strong>. It holds a
        signed token that identifies you to the service. It is httpOnly, so
        scripts on the page cannot read it, and it is marked secure in
        production. It lasts 30 days or until you sign out.
      </p>
      <p>
        Our analytics is cookieless, so it adds nothing here. There are no
        advertising or cross-site tracking cookies, and therefore no consent
        banner to dismiss.
      </p>

      <h2>3. Why we process your data</h2>
      <ul>
        <li>
          <strong>To provide the service</strong> - generating images, keeping
          your gallery, tracking your credit balance. This is contractual
          necessity.
        </li>
        <li>
          <strong>To take payment</strong> - creating and verifying orders, and
          keeping transaction records for accounting and support. This is
          contractual and legal obligation.
        </li>
        <li>
          <strong>To keep the service working</strong> - rate limiting, abuse
          prevention, and debugging. This is our legitimate interest in a
          functioning, non-abused service.
        </li>
        <li>
          <strong>To enforce our acceptable use policy</strong> - reviewing
          prompts and images that trigger our filters or are reported to us.
        </li>
      </ul>
      <p>
        We do not sell your data, rent it, or use your prompts or images to train
        any model of our own.
      </p>

      <h2>4. Who else sees your data</h2>
      <p>We share the minimum necessary with four categories of processor:</p>
      <ul>
        <li>
          <strong>ClipDrop</strong> receives your prompt text in order to
          generate the image. It does not receive your name, email, or account
          identifier. Their handling of that prompt is governed by their own
          privacy policy.
        </li>
        <li>
          <strong>Cloudinary</strong> stores your generated images and serves
          them back to your browser.
        </li>
        <li>
          <strong>Razorpay</strong> handles payment. They receive your name and
          email to prefill checkout, plus whatever payment details you give them
          directly.
        </li>
        <li>
          <strong>Vercel</strong> hosts the application and provides the
          cookieless analytics described above. As the host, their infrastructure
          necessarily processes requests you make to the site.
        </li>
      </ul>
      <p>
        We may also disclose data if we are legally required to, or where it is
        necessary to investigate a serious breach of our acceptable use policy.
      </p>

      <h2>5. Public images</h2>
      <p>
        Images are private by default. If you choose to publish one to the
        community showcase, that image and its prompt become visible to anyone
        visiting the site, including people without an account. Your name and
        email are never attached to a published image.
      </p>
      <p>
        Making an image private again removes it from the showcase immediately.
        Copies other people already downloaded are, of course, beyond our reach.
      </p>

      <h2>6. How long we keep things</h2>
      <ul>
        <li>
          <strong>Account and gallery data</strong> - until you delete it or
          close your account.
        </li>
        <li>
          <strong>Deleted images</strong> - removed from our database and from
          image storage when you delete them.
        </li>
        <li>
          <strong>Transaction records</strong> - retained after account closure
          where tax and accounting law requires it, typically several years.
          These are stripped of everything but the financial facts.
        </li>
        <li>
          <strong>Rate limit counters</strong> - minutes, then automatically
          purged.
        </li>
      </ul>

      <h2>7. Your rights</h2>
      <p>
        You can access your data, correct it, export it, or have it deleted. Some
        of this is self-serve: your gallery shows everything you have generated
        and lets you delete any of it, and your account page shows your full
        purchase history.
      </p>
      <p>
        For anything else - a full export, or deletion of your entire account -
        email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>. We
        will respond within 30 days. If you have unspent credits when you ask us
        to delete your account, tell us and we will handle any refund under the{" "}
        <a href="/refunds">Refund Policy</a> before deleting.
      </p>

      <h2>8. Security</h2>
      <p>
        Passwords are hashed with bcrypt. Session tokens are signed and stored in
        httpOnly cookies. All API keys and payment secrets are held server-side
        and are never sent to the browser. Payment confirmations are verified by
        cryptographic signature rather than trusted from the client.
      </p>
      <p>
        No system is perfectly secure. If you believe your account has been
        accessed by someone else, change your password and contact us.
      </p>

      <h2>9. Children</h2>
      <p>
        PixScribe is not for under-18s. We do not knowingly collect data from
        children. If you believe a child has created an account, contact us and
        we will delete it.
      </p>

      <h2>10. Changes</h2>
      <p>
        If we change this policy in a way that materially affects you, we will
        email account holders before it takes effect. The date at the top always
        reflects the current version.
      </p>
    </LegalShell>
  );
}
