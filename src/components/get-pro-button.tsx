"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface GetProButtonProps {
  /** Extra Tailwind classes */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Reusable CTA that routes users to the upgrade page where they can choose a plan.
 */
export function GetProButton({ className = "", children = "Get Pro" }: GetProButtonProps) {
  const router = useRouter();
  const baseClass =
    "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700";
  return (
    <Button
      size="sm"
      className={`${baseClass} ${className}`.trim()}
      onClick={() => router.push("/upgrade")}
    >
      {children}
    </Button>
  );
} 