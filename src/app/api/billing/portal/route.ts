import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.redirect(new URL("/admin/settings?billing=not-configured", request.url));
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user?.stripeCustomerId) {
    return NextResponse.redirect(new URL("/admin/settings?billing=no-customer", request.url));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/admin/settings`,
  });

  return NextResponse.redirect(portal.url);
}
