import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Geist,
  Geist_Mono,
  Instrument_Serif,
} from "next/font/google";
import { SITE } from "@/config/site";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { readSession } from "@/lib/auth/session";
import { getUserById, type PublicUser } from "@/server/services/auth.service";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: `${SITE.name} - ${SITE.tagline}`,
    template: `%s - ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} - ${SITE.tagline}`,
    description: SITE.description,
    type: "website",
    siteName: SITE.name,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#06060a",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Resolving the user on the server means the header renders with the right
  // credit balance on first paint - no signed-out flash, no loading spinner.
  const session = await readSession();
  let initialUser: PublicUser | null = null;
  if (session) {
    initialUser = await getUserById(session.userId).catch(() => null);
  }

  return (
    <html
      lang="en"
      // globals.css sets scroll-behavior: smooth; this tells Next to suppress it
      // during route transitions so navigation still jumps to the top instantly.
      data-scroll-behavior="smooth"
      className={`${bricolage.variable} ${geist.variable} ${geistMono.variable} ${instrument.variable} h-full`}
    >
      <body className="grain flex min-h-full flex-col antialiased">
        <ToastProvider>
          <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
