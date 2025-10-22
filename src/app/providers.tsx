"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "@/lib/trpc";
import superjson from "superjson";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import type { UserProfile } from "@auth0/nextjs-auth0/client";

interface ProvidersProps {
  children: React.ReactNode;
  /**
   * When supplied, the user profile is used as the initial state for the
   * Auth0 `UserProvider`. This disables the additional network request that
   * would normally run on mount, eliminating the visual delay before the
   * account avatar appears.
   */
  initialUser?: UserProfile;
}

export function Providers({ children, initialUser }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
          },
        },
      })
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <UserProvider user={initialUser ?? undefined}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </UserProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
