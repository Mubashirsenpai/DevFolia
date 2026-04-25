import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function getPriceIdForPlan(plan: string): string | null {
  if (plan === "PRO") return process.env.STRIPE_PRICE_PRO ?? null;
  if (plan === "BUSINESS") return process.env.STRIPE_PRICE_BUSINESS ?? null;
  return null;
}
