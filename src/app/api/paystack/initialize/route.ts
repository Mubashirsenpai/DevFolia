import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_AMOUNTS, normalizePlan, getPaystackSecretKey } from "@/lib/paystack";
import { logPlatformEvent } from "@/lib/platform-events";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  const url = new URL(request.url);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${url.protocol}//${url.host}`;

  if (!session) {
    return NextResponse.redirect(
      `${appUrl}/admin/login?from=${encodeURIComponent("/billing")}`,
    );
  }

  const formData = await request.formData();
  const plan = normalizePlan(String(formData.get("plan") ?? "FREE"));
  if (plan === "FREE") {
    await prisma.user.update({
      where: { id: session.sub },
      data: { plan: "FREE", subscriptionStatus: "active" },
    });
    await logPlatformEvent({
      type: "billing.plan_selected_free",
      userId: session.sub,
    });
    return NextResponse.redirect(`${appUrl}/billing?status=free`);
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return NextResponse.redirect(`${appUrl}/billing?status=user-not-found`);

  const secretKey = getPaystackSecretKey();
  if (!secretKey) return NextResponse.redirect(`${appUrl}/billing?status=not-configured`);

  const reference = `devfolia_${session.sub}_${Date.now()}`;
  const callbackUrl = `${appUrl}/billing/callback`;

  const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.billingEmail ?? user.email,
      amount: PLAN_AMOUNTS[plan],
      reference,
      callback_url: callbackUrl,
      metadata: {
        userId: user.id,
        plan,
      },
    }),
  });

  const data = (await paystackResponse.json()) as {
    status: boolean;
    data?: { authorization_url?: string };
  };

  if (!data.status || !data.data?.authorization_url) {
    await logPlatformEvent({
      type: "billing.paystack_initialize_failed",
      userId: session.sub,
      metadata: { plan },
    });
    return NextResponse.redirect(`${appUrl}/billing?status=initialize-failed`);
  }

  await logPlatformEvent({
    type: "billing.paystack_initialize_success",
    userId: session.sub,
    metadata: { plan, reference },
  });

  return NextResponse.redirect(data.data.authorization_url);
}
