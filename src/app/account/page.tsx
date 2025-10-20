import { getSession } from "@auth0/nextjs-auth0";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import dynamicImport from "next/dynamic";

const AccountProfileForm = dynamicImport(() => import("@/components/account-profile-form"), {
  ssr: false,
});

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/auth");
  }

  const { user } = session;

  // TODO: Replace with real Stripe lookup
  const billing = {
    plan: "Free",
    status: "active",
    nextBilling: null,
  };

  const meta = (user as any).user_metadata ?? {};

  return (
    <main className="container mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold">My Account</h1>

      <section className="mb-12 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Profile</h2>

        <div className="flex items-center gap-4 mb-6">
          {user.picture && (
            <Image
              src={user.picture}
              alt="avatar"
              width={64}
              height={64}
              className="rounded-full"
            />
          )}
          <div>
            <p className="font-medium text-slate-900">{user.name ?? user.nickname}</p>
            <p className="text-slate-600">{user.email}</p>
          </div>
        </div>

        {/* editable profile form */}
        <AccountProfileForm
          initialName={meta.name ?? user.name ?? ""}
          initialProgram={meta.program}
          initialTerm={meta.term}
          email={user.email ?? ""}
        />
      </section>

      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Billing</h2>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Current plan</span>
            <span className="font-medium text-slate-900">{billing.plan}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Status</span>
            <span className="capitalize text-slate-900">{billing.status}</span>
          </div>
          {billing.nextBilling && (
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Next billing date</span>
              <span className="text-slate-900">{billing.nextBilling}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-4">
          <Link
            href="/upgrade"
            className="rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow hover:from-blue-700 hover:to-purple-700"
          >
            Upgrade Plan
          </Link>
          <Link
            href="/api/billing/portal"
            className="rounded-md border px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Manage Billing
          </Link>
        </div>
      </section>
    </main>
  );
}
