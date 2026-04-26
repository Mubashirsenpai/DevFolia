export const PLAN_LABELS: Record<string, string> = {
  FREE: "Free",
  PRO: "Pro",
  BUSINESS: "Business",
};

// Amounts in pesewas (GHS smallest unit)
export const PLAN_AMOUNTS: Record<string, number> = {
  FREE: 0,
  PRO: 1200,
  BUSINESS: 2900,
};

export function normalizePlan(raw: string): "FREE" | "PRO" | "BUSINESS" {
  const value = raw.toUpperCase();
  if (value === "PRO" || value === "BUSINESS") return value;
  return "FREE";
}

export function getPaystackSecretKey() {
  return process.env.PAYSTACK_SECRET_KEY ?? "";
}
