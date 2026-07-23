import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { SITE } from "@/config/site";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/studio", label: "Studio" },
      { href: "/explore", label: "Explore" },
      { href: "/pricing", label: "Pricing" },
      { href: "/gallery", label: "Your gallery" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/refunds", label: "Refund Policy" },
    ],
  },
  {
    title: "Support",
    links: [{ href: `mailto:${SITE.supportEmail}`, label: SITE.supportEmail }],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative mt-auto border-t border-[var(--line)]">
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-14">
        <div className="md:grid md:grid-cols-[1.6fr_1fr_1fr_1fr] md:gap-10">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {SITE.description}
            </p>
          </div>

          {/* Stacking four blocks vertically makes for a very tall mobile
              footer, so the link columns pair up until there is room for the
              full four-column row. `md:contents` dissolves this wrapper so the
              columns rejoin the parent grid on desktop. */}
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 md:contents md:mt-0">
            {COLUMNS.map((column, index) => (
              <div
                key={column.title}
                // The support email is too wide for a half-width column.
                className={index === COLUMNS.length - 1 ? "col-span-2 md:col-span-1" : undefined}
              >
                <h3 className="eyebrow">{column.title}</h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="break-words text-sm text-muted transition-colors hover:text-bright"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-[var(--line)] pt-6 text-xs leading-relaxed text-faint sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <p>
            &copy; {new Date().getFullYear()} {SITE.legalEntity}. All rights reserved.
          </p>
          <p className="text-balance-pretty">
            Payments processed securely by Razorpay. Images generated via ClipDrop.
          </p>
        </div>
      </div>
    </footer>
  );
}
