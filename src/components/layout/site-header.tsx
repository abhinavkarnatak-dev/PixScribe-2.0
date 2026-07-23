"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LogOut, Menu, User, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button, ButtonLink } from "@/components/ui/button";
import { CreditPill } from "@/components/ui/credit-pill";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/studio", label: "Studio", authOnly: true },
  { href: "/gallery", label: "Gallery", authOnly: true },
  { href: "/explore", label: "Explore", authOnly: false },
  { href: "/pricing", label: "Pricing", authOnly: false },
] as const;

export function SiteHeader() {
  const { user, isSignedIn, signOut } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile sheet whenever navigation happens.
  useEffect(() => setMenuOpen(false), [pathname]);

  // While the sheet is open it owns the screen: the page behind must not
  // scroll, and Escape should dismiss it.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const links = NAV_LINKS.filter((link) => !link.authOnly || isSignedIn);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-[var(--line)] bg-void/70 backdrop-blur-xl"
            : "border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-5 sm:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm transition-colors",
                  active ? "text-bright" : "text-muted hover:text-bright",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-white/[0.07]"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                ) : null}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          {isSignedIn && user ? (
            <>
              <Link
                href="/pricing"
                className="hidden sm:block"
                aria-label={`${user.credits} credits remaining. Buy more.`}
              >
                <CreditPill credits={user.credits} />
              </Link>
              <Link
                href="/account"
                className="hidden size-9 place-items-center rounded-full border border-[var(--line-strong)] bg-surface-2/70 text-muted transition-colors hover:text-bright sm:grid"
                aria-label="Account"
              >
                <User className="size-4" />
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void signOut()}
                className="hidden md:inline-flex"
              >
                <LogOut className="size-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
                Log in
              </ButtonLink>
              <ButtonLink href="/signup" size="sm">
                Start free
              </ButtonLink>
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="grid size-9 place-items-center rounded-full border border-[var(--line-strong)] bg-surface-2/70 text-muted transition-colors hover:text-bright md:hidden"
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          </div>
        </div>
      </header>

      {/* Rendered as a sibling of <header>, not inside it. The header applies
          backdrop-blur once scrolled, which would make it the containing block
          for position:fixed descendants and trap this overlay in its 64px box. */}
      <AnimatePresence>
        {menuOpen ? (
          <>
            {/* Blurs the page behind the sheet and closes it on tap. */}
            <motion.button
              type="button"
              aria-label="Close menu"
              tabIndex={-1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 cursor-default bg-void/60 backdrop-blur-xl md:hidden"
            />

            {/* Fixed, so opening the sheet overlays the page instead of
                pushing the content below it down. */}
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-[var(--line)] bg-void/95 shadow-2xl shadow-black/60 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-1 px-5 py-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3 py-2.5 text-[15px] text-muted transition-colors hover:bg-white/5 hover:text-bright"
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 border-t border-[var(--line)] pt-3">
                {isSignedIn && user ? (
                  <div className="flex items-center justify-between gap-3">
                    <Link href="/account" className="flex items-center gap-2.5">
                      <span className="grid size-9 place-items-center rounded-full bg-surface-2 text-muted">
                        <User className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-bright">
                          {user.name}
                        </span>
                        <span className="block text-xs text-faint">
                          {user.credits} credits
                        </span>
                      </span>
                    </Link>
                    <Button variant="secondary" size="sm" onClick={() => void signOut()}>
                      Sign out
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <ButtonLink href="/login" variant="secondary" size="sm" className="flex-1">
                      Log in
                    </ButtonLink>
                    <ButtonLink href="/signup" size="sm" className="flex-1">
                      Start free
                    </ButtonLink>
                  </div>
                )}
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
