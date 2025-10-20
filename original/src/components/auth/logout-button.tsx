"use client";

import { Button } from "@/components/ui/button";

export function LogoutButton({
  variant = "outline",
}: {
  variant?: "ghost" | "outline" | "default";
}) {
  return (
    <Button asChild variant={variant} size="sm">
      {/* anchor element accepted via Button's `asChild` prop */}
      <a href="/api/auth/logout">Log Out</a>
    </Button>
  );
}
