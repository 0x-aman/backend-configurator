import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { stripe } from "@/src/lib/stripe";
export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature") || "";
  const buf = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  switch (event.type) {
    case "invoice.payment_succeeded": {
      const inv: any = event.data.object;
      const sub = inv.subscription as string;
      const client = await prisma.client.findFirst({
        where: { stripeSubscriptionId: sub },
      });
      if (client) {
        await prisma.billingUsage.updateMany({
          where: { clientId: client.id },
          data: { chargedBlocks: 0, lastSync: new Date() },
        });
      }
      break;
    }
    default:
      break;
  }
  return NextResponse.json({ ok: true });
}
