import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getServerSession } from "@/lib/auth-server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UW Course Graph & Planner",
  description:
    "Visualize course dependencies and plan your academic journey at the University of Waterloo.",
  icons: {
    icon: "/assets/uwplanit-grayscale-logo.svg",
    shortcut: "/assets/uwplanit-grayscale-logo.svg",
    apple: "/assets/uwplanit-grayscale-logo.svg",
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch the current Auth0 session on the server so we can provide the user
  // payload during the initial render. This removes the need for a client-side
  // round-trip to `/api/auth/me` and prevents a noticeable flash before the
  // account avatar or login button appears.
  // If Auth0 is not configured (missing env vars), gracefully handle and run without auth.
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers initialUser={session?.user}>{children}</Providers>
      </body>
    </html>
  );
}
