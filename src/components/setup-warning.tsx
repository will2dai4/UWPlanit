"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SetupWarningProps {
  missingAuth0?: boolean;
  missingSupabase?: boolean;
}

/**
 * Displays a warning banner when environment variables are not configured.
 * This helps developers get started quickly.
 */
export function SetupWarning({ missingAuth0, missingSupabase }: SetupWarningProps) {
  if (!missingAuth0 && !missingSupabase) {
    return null;
  }

  return (
    <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Environment Setup Required
        </CardTitle>
        <CardDescription className="text-yellow-800 dark:text-yellow-200">
          Some features are disabled because environment variables are not configured.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {missingAuth0 && (
          <div>
            <Badge variant="outline" className="mb-2 border-yellow-600 text-yellow-900 dark:text-yellow-100">
              Auth0 Not Configured
            </Badge>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Authentication features are disabled. To enable them, set up Auth0 environment variables in{" "}
              <code className="rounded bg-yellow-100 px-1 py-0.5 dark:bg-yellow-900">.env.local</code>
            </p>
          </div>
        )}
        {missingSupabase && (
          <div>
            <Badge variant="outline" className="mb-2 border-yellow-600 text-yellow-900 dark:text-yellow-100">
              Supabase Not Configured
            </Badge>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Database features are disabled. To enable them, set up Supabase environment variables in{" "}
              <code className="rounded bg-yellow-100 px-1 py-0.5 dark:bg-yellow-900">.env.local</code>
            </p>
          </div>
        )}
        <div className="rounded-md bg-yellow-100 p-3 dark:bg-yellow-900/30">
          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
            📖 See the <code>README.md</code> for detailed setup instructions
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

