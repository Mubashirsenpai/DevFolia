import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPriceIdForPlan, getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const formData = await request.formData();
  const plan = String(formData.get("plan") ?? "PRO").toUpperCase();
  if (plan !== "PRO" && plan !== "BUSINESS") {
    return NextResponse.redirect(new URL("/admin/settings?billing=invalid-plan", request.url));
  }

  const stripe = getStripe();
  const price = getPriceIdForPlan(plan);
  if (!stripe || !price) {
    return NextResponse.redirect(new URL("/admin/settings?billing=not-configured", request.url));
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) {
    return NextResponse.redirect(new URL("/admin/settings?billing=no-user", request.url));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.billingEmail ?? user.email,
    line_items: [{ price, quantity: 1 }],
    success_url: `${appUrl}/admin/settings?billing=success`,
    cancel_url: `${appUrl}/admin/settings?billing=cancelled`,
    metadata: { userId: user.id, plan },
  });

  if (!checkout.url) {
    return NextResponse.redirect(new URL("/admin/settings?billing=error", request.url));
  }
  return NextResponse.redirect(checkout.url);
}
