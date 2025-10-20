import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSession } from "@auth0/nextjs-auth0";
import { supabaseAdmin } from "@/lib/supabase";

interface RequestBody {
  plan: "monthly" | "yearly";
  email?: string; // legacy fallback when no Auth0 session
}

export async function POST(req: Request) {
  try {
    const { plan, email } = (await req.json()) as RequestBody;

    if (!plan) {
      return NextResponse.json({ error: "Missing plan" }, { status: 400 });
    }

    const priceId =
      plan === "yearly"
        ? process.env.STRIPE_PRICE_LIFETIME_ID
        : process.env.STRIPE_PRICE_MONTHLY_ID;

    if (!priceId) {
      return NextResponse.json({ error: "Price not configured" }, { status: 500 });
    }

    // 1️⃣  Get Auth0 user (if logged-in)
    const authSession = await getSession();
    const userSub = authSession?.user?.sub ?? null;

    // 2️⃣  Resolve / create Stripe customer
    let customerId: string | undefined;
    if (userSub) {
      const sb: any = supabaseAdmin;
      const { data: userRow } = await sb
        .from("auth.users")
        .select("stripe_customer_id,email")
        .eq("id", userSub)
        .single();

      if (userRow?.stripe_customer_id) {
        customerId = userRow.stripe_customer_id;
      } else {
        const customer = await stripe.customers.create({
          email: authSession?.user?.email ?? email ?? undefined,
          metadata: { auth0_id: userSub },
        });
        customerId = customer.id;
        await sb
          .from("auth.users")
          .update({ stripe_customer_id: customerId })
          .eq("id", userSub);
      }
    }

    // Ensure we have at least an email when no existing customer
    const checkoutEmail = email ?? authSession?.user?.email;

    if (!customerId && !checkoutEmail) {
      return NextResponse.json({ error: "Must be logged in or provide email" }, { status: 400 });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/pricing`,
      client_reference_id: userSub ?? undefined,
      ...(customerId
        ? { customer: customerId }
        : { customer_email: checkoutEmail }),
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 