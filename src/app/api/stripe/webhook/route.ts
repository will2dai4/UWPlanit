import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs"; // ensure full Node.js APIs are available

export async function POST(req: Request) {
  const signature = headers().get("stripe-signature");
  const payload = await req.text();

  if (!signature) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed.", err);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const userSub = session.client_reference_id ?? null;

        const sb: any = supabaseAdmin;
        if (userSub) {
          await sb
            .from("auth.users")
            .update({ stripe_customer_id: customerId, plan: "premium" })
            .eq("id", userSub);
        } else {
          await sb
            .from("auth.users")
            .update({ plan: "premium" })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const sb: any = supabaseAdmin;
        await sb
          .from("auth.users")
          .update({ plan: "premium" })
          .eq("stripe_customer_id", customerId);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const sb: any = supabaseAdmin;
        await sb
          .from("auth.users")
          .update({ plan: "free" })
          .eq("stripe_customer_id", customerId);
        // TODO: email notice / grace period handling
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const sb: any = supabaseAdmin;
        await sb
          .from("auth.users")
          .update({ plan: "free" })
          .eq("stripe_customer_id", customerId);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler failed", err);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
} 