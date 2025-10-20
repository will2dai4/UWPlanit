"use client";

import { LoginButton } from "@/components/auth/login-button";
import { SignupButton } from "@/components/auth/signup-button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="w-full max-w-md rounded-xl bg-white/80 p-8 shadow-lg backdrop-blur-md">
        <h1 className="mb-8 text-center text-3xl font-semibold text-slate-900">Welcome</h1>
        <p className="mb-6 text-center text-slate-600">
          Sign in to your existing account or create a new one to start planning your academic
          journey.
        </p>
        <div className="flex flex-col gap-4">
          <LoginButton variant="outline" />
          <SignupButton />
        </div>
        <Button variant="ghost" className="mt-8 w-full" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
}
