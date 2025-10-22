import { getSession } from "@auth0/nextjs-auth0";
import Image from "next/image";
import { redirect } from "next/navigation";
import dynamicImport from "next/dynamic";
import { supabaseAdmin } from "@/lib/supabase";

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

  // Fetch user profile from Supabase (our source of truth)
  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", user.sub)
    .single();

  return (
    <main className="container mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Account</h1>
        <a
          href="/"
          className="text-sm text-slate-600 hover:text-slate-900 underline-offset-4 hover:underline"
        >
          ← Back to Home
        </a>
      </div>

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
            <p className="font-medium text-slate-900">{profile?.name ?? user.name ?? user.nickname}</p>
            <p className="text-slate-600">{user.email}</p>
          </div>
        </div>

        {/* editable profile form */}
        <AccountProfileForm
          initialName={profile?.name ?? user.name ?? ""}
          initialProgram={profile?.program ?? ""}
          initialTerm={profile?.current_term ?? ""}
          email={user.email ?? ""}
        />
      </section>
    </main>
  );
}
