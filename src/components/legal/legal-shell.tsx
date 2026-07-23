import Link from "next/link";
import { AuroraBackdrop } from "@/components/ui/aurora-backdrop";
import { SITE } from "@/config/site";

const LEGAL_PAGES = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refunds", label: "Refund Policy" },
] as const;

/**
 * Shared chrome for legal documents.
 *
 * Prose styling lives here rather than in each page, so the three documents
 * stay visually identical and the pages themselves are just content.
 */
export function LegalShell({
  title,
  summary,
  current,
  children,
}: {
  title: string;
  summary: string;
  current: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <AuroraBackdrop intensity="subtle" />

      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="max-w-3xl">
          <p className="eyebrow">Legal</p>
          <h1 className="font-display mt-4 text-[clamp(2.25rem,5.5vw,3.5rem)] text-balance-pretty text-bright">
            {title}
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-muted">{summary}</p>
          <p className="mt-4 font-mono text-xs text-faint">
            Last updated {SITE.legalUpdated}
          </p>
        </div>

        <nav className="mt-10 flex flex-wrap gap-2" aria-label="Legal documents">
          {LEGAL_PAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              aria-current={page.href === current ? "page" : undefined}
              className={
                page.href === current
                  ? "rounded-full bg-white/[0.09] px-4 py-2 text-[13px] text-bright ring-1 ring-white/15"
                  : "rounded-full border border-[var(--line)] px-4 py-2 text-[13px] text-muted transition-colors hover:border-white/20 hover:text-bright"
              }
            >
              {page.label}
            </Link>
          ))}
        </nav>

        <article
          className={[
            "mt-14 max-w-3xl",
            "[&_h2]:font-display [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:text-bright",
            "[&_h3]:mt-8 [&_h3]:text-[15px] [&_h3]:font-medium [&_h3]:text-bright",
            "[&_p]:mt-4 [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:text-muted",
            "[&_ul]:mt-4 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2.5 [&_ul]:pl-5",
            "[&_li]:list-disc [&_li]:text-[15px] [&_li]:leading-relaxed [&_li]:text-muted",
            "[&_li::marker]:text-faint",
            "[&_a]:text-bright [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-iris-soft",
            "[&_strong]:font-medium [&_strong]:text-bright",
          ].join(" ")}
        >
          {children}
        </article>

        <div className="mt-16 max-w-3xl border-t border-[var(--line)] pt-8">
          <p className="text-[15px] leading-relaxed text-muted">
            Questions about any of this? Email{" "}
            <a
              href={`mailto:${SITE.supportEmail}`}
              className="text-bright underline underline-offset-4 hover:text-iris-soft"
            >
              {SITE.supportEmail}
            </a>{" "}
            and a human will reply.
          </p>
        </div>
      </div>
    </div>
  );
}
