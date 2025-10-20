import Stripe from "stripe";

// Centralised Stripe SDK instance used server-side only. NEVER import this in client components.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // Keep the version pinned for reproducible behaviour.
  apiVersion: "2023-10-16",
  typescript: true,
}); 