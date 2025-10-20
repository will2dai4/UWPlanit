"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";

interface UpgradeButtonProps {
  /** Billing plan to purchase. Defaults to monthly subscription. */
  plan?: "monthly" | "yearly";
  /** Optional additional CSS classes to merge with default. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Triggers Stripe Checkout for the given plan and redirects the browser to the
 * hosted page returned by the `/api/billing/checkout` route.
 */
export function UpgradeButton({
  plan = "monthly",
  className,
  children = "Upgrade",
}: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      // If not logged in, redirect to auth page first
      if (!user) {
        router.push("/auth");
        return;
      }

      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url as string;
        return; // stop here – we are navigating away
      }

      console.error("Stripe checkout error", data);
    } catch (err) {
      console.error(err);
    } finally {
      // If redirect didn't happen (error), re-enable button
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      className={className}
      disabled={isLoading}
      onClick={handleClick}
    >
      {isLoading ? "Redirecting…" : children}
    </Button>
  );
} 