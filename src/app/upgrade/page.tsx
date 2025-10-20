"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UpgradeButton } from "@/components/upgrade-button";
import { LoginButton } from "@/components/auth/login-button";
import { AccountMenu } from "@/components/account-menu";

export default function UpgradePage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-16 px-6">
      {/* Header */}
      <header className="mx-auto mb-12 flex max-w-7xl items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} size="sm">
          ← Back
        </Button>
        {!isLoading && (user ? <AccountMenu /> : <LoginButton variant="outline" />)}
      </header>

      {/* Plan options */}
      <section className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        {/* Monthly Subscription */}
        <div className="flex flex-col rounded-xl border bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold">Monthly</h2>
          <p className="mb-6 text-sm text-slate-600">
            Enjoy all premium features for a low monthly price. Cancel anytime.
          </p>
          <div className="mb-8 flex items-end gap-2">
            <span className="text-4xl font-extrabold">$2.99</span>
            <span className="mb-1 text-slate-500 text-sm">/ month</span>
          </div>
          <UpgradeButton plan="monthly" className="mt-auto w-full bg-gradient-to-r from-blue-600 to-purple-600">
            Subscribe
          </UpgradeButton>
        </div>

        {/* Lifetime One-Time */}
        <div className="flex flex-col rounded-xl border bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold">Lifetime</h2>
          <p className="mb-6 text-sm text-slate-600">
            One-time payment for unlimited access — no renewals, no worries.
          </p>
          <div className="mb-8 flex items-end gap-2">
            <span className="text-4xl font-extrabold">$12.99</span>
            <span className="mb-1 text-slate-500 text-sm">one time</span>
          </div>
          <UpgradeButton plan="yearly" className="mt-auto w-full bg-gradient-to-r from-blue-600 to-purple-600">
            Buy Once
          </UpgradeButton>
        </div>
      </section>
    </main>
  );
} 