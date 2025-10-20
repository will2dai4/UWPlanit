"use client";

import { Button } from "@/components/ui/button";

export function SignupButton({
  variant = "default",
}: {
  variant?: "ghost" | "outline" | "default";
}) {
  return (
    <Button
      asChild
      variant={variant}
      size="sm"
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
    >
      {/* anchor element accepted via Button's `asChild` prop */}
      <a href="/api/auth/signup">Get Started</a>
    </Button>
  );
}
