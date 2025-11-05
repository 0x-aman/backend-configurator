import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/src/lib/prisma";
import { stripe } from "@/src/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });

    const client = await prisma.client.findUnique({
      where: { email: session.user.email },
      select: { stripeCustomerId: true },
    });

    if (!client?.stripeCustomerId)
      return new Response(
        JSON.stringify({ error: "Missing Stripe customer" }),
        { status: 400 }
      );

    const body = await req.json();
    const { successUrl, cancelUrl } = body;

    // Ensure success URL includes the Stripe checkout session id placeholder so
    // the client can verify the session after redirect.
    const baseSuccess =
      successUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`;
    const successWithSession = baseSuccess.includes("{CHECKOUT_SESSION_ID}")
      ? baseSuccess
      : `${baseSuccess}${baseSuccess.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`;

    const baseCancel =
      cancelUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`;

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: client.stripeCustomerId,
      success_url: successWithSession,
      cancel_url: baseCancel,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: 1000, // €10
            product_data: {
              name: "+10 Option Capacity",
              description: "Add 10 extra options for your configurator limit",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "OPTION_BLOCK", // <- REQUIRED so webhook knows what to do
      },
    });

    return Response.json({ url: checkout.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "internal error" }),
      { status: 500 }
    );
  }
}
