import Link from "next/link";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logPlatformEvent } from "@/lib/platform-events";

export default async function BillingCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const session = await getCurrentSession();
  const { reference } = await searchParams;

  let message = "Verification failed.";
  let success = false;

  const secret = process.env.PAYSTACK_SECRET_KEY ?? "";

  if (!reference?.trim()) {
    message = "Missing transaction reference.";
  } else if (!secret) {
    message = "Paystack is not configured.";
  } else {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference.trim())}`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    });
    const data = (await res.json()) as {
      status: boolean;
      data?: {
        status?: string;
        metadata?: { plan?: string; userId?: string };
      };
    };

    if (!data.status || data.data?.status !== "success") {
      message = "Payment not completed or could not be verified.";
      if (session) {
        await logPlatformEvent({
          type: "billing.payment_incomplete",
          userId: session.sub,
          metadata: { reference },
        });
      }
    } else {
      const paystackUserId = data.data?.metadata?.userId;
      if (typeof paystackUserId !== "string" || paystackUserId.length < 8) {
        message = "Payment metadata is invalid. Contact support with your reference.";
      } else if (session && session.sub !== paystackUserId) {
        message =
          "This payment belongs to another account. Sign in with the account that paid, or contact support.";
      } else {
        const planRaw = data.data?.metadata?.plan ?? "PRO";
        const plan =
          planRaw === "BUSINESS" ? "BUSINESS" : planRaw === "PRO" ? "PRO" : "FREE";

        const userRow = await prisma.user.findUnique({
          where: { id: paystackUserId },
          select: { id: true },
        });
        if (!userRow) {
          message = "Account not found for this payment.";
        } else {
          await prisma.user.update({
            where: { id: paystackUserId },
            data: { plan, subscriptionStatus: "active" },
          });
          success = true;
          message = `Payment successful. Your ${plan} plan is now active.`;
          await logPlatformEvent({
            type: "billing.payment_success",
            userId: paystackUserId,
            metadata: { plan, reference },
          });
        }
      }
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-16 sm:px-6">
      <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <h1 className="text-2xl font-bold text-white">Payment status</h1>
        <p
          className={`mt-3 text-sm ${
            success ? "text-emerald-300" : "text-slate-300"
          }`}
        >
          {message}
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/admin/settings"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Go to settings
          </Link>
          <Link
            href="/billing"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-emerald-500/40 hover:text-emerald-300"
          >
            Back to billing
          </Link>
        </div>
      </div>
    </main>
  );
}
