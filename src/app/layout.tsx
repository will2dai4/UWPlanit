import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getSession } from "@auth0/nextjs-auth0";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UW Course Graph & Planner",
  description:
    "Visualize course dependencies and plan your academic journey at the University of Waterloo.",
  icons: {
    icon: "/uw_planit_logo_blue_transparent.svg",
    shortcut: "/uw_planit_logo_blue_transparent.svg",
    apple: "/uw_planit_logo_blue_transparent.svg",
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
  let session = null;
  try {
    session = await getSession();
  } catch (error) {
    console.warn("Auth0 not configured. Running without authentication:", error);
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers initialUser={session?.user}>{children}</Providers>
      </body>
    </html>
  );
}
