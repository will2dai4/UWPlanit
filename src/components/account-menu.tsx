"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export function AccountMenu() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Account menu">
          {user.picture ? (
            <Image
              src={user.picture}
              alt="avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <User className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <Link href="/account">Account</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/api/auth/logout">Log out</a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
