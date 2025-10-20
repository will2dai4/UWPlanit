import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSession } from "@auth0/nextjs-auth0";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const authSession = await getSession();
    if (!authSession?.user) {
      // 303 so the browser follows the redirect with GET
      return NextResponse.redirect("/auth", 303);
    }

    const sb: any = supabaseAdmin;
    const { data: userRow, error } = await sb
      .from("auth.users")
      .select("stripe_customer_id")
      .eq("id", authSession.user.sub)
      .single();

    if (error || !userRow?.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer linked" }, { status: 400 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userRow.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/account`,
    });

    return NextResponse.redirect(portalSession.url, 303);
  } catch (error) {
    console.error("Stripe portal error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
