"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * This page now redirects to /account since users are automatically
 * registered in the database upon Auth0 signup, and profile completion
 * is handled via the account page.
 */
export default function CompleteProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/account");
  }, [router]);

  return null;
}
