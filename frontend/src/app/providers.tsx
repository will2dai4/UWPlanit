"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@auth0/nextjs-auth0/client";

interface ProvidersProps {
  children: React.ReactNode;
  /**
   * When supplied, the user profile is used as the initial state for the
   * Auth0 `UserProvider`. This disables the additional network request that
   * would normally run on mount, eliminating the visual delay before the
   * account avatar appears.
   */
  initialUser?: any;
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

  return (
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
  );
}
