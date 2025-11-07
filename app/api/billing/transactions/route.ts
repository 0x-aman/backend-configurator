// Get transaction history from Stripe
import { NextRequest } from "next/server";
import { authenticateRequest } from "@/src/middleware/auth";
import { stripe } from "@/src/lib/stripe";
import { success, fail, unauthorized } from "@/src/lib/response";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);

    if (!client.stripeCustomerId) {
      console.log(`Client ${client.id} has no Stripe customer ID yet`);
      return success([]);
    }

    console.log(
      `Fetching transactions for client ${client.id} (${client.email})`
    );

    // Fetch both invoices (subscriptions) and payment intents (one-time payments)
    const [invoices, paymentIntents] = await Promise.all([
      stripe.invoices.list({
        customer: client.stripeCustomerId,
        limit: 100,
      }),
      stripe.paymentIntents.list({
        customer: client.stripeCustomerId,
        limit: 100,
      }),
    ]);

    console.log(
      `Found ${invoices.data.length} invoices and ${paymentIntents.data.length} payment intents for client ${client.id}`
    );

    const transactions = [];

    // Transform invoices (subscription payments) to transaction format
    for (const invoice of invoices.data) {
      transactions.push({
        id: invoice.id,
        date: new Date(invoice.created * 1000),
        amount: invoice.total / 100, // Convert from cents to euros
        currency: invoice.currency.toUpperCase(),
        planType:
          invoice.lines.data[0]?.price?.recurring?.interval === "year"
            ? "Yearly"
            : "Monthly",
        status:
          invoice.status === "paid"
            ? "Paid"
            : invoice.status === "open"
              ? "Pending"
              : "Failed",
        invoiceUrl: invoice.hosted_invoice_url,
        invoicePdf: invoice.invoice_pdf,
      });
    }

    // Transform payment intents (one-time payments like capacity upgrades)
    for (const payment of paymentIntents.data) {
      // Only include successful payments
      if (payment.status === "succeeded") {
        // Try to get metadata from the payment or its related checkout session
        let planType = "One-time Payment";

        // Check if this is an option block purchase
        if (
          payment.metadata?.type === "OPTION_BLOCK" ||
          payment.description?.includes("Option Capacity")
        ) {
          planType = "+10 Options";
        }

        // Check audit log for more context
        const auditEvent = await prisma.auditBillingEvent.findFirst({
          where: {
            clientId: client.id,
            event: "OPTION_BLOCK_PURCHASED",
          },
          orderBy: { createdAt: "desc" },
        });

        transactions.push({
          id: payment.id,
          date: new Date(payment.created * 1000),
          amount: payment.amount / 100,
          currency: payment.currency.toUpperCase(),
          planType: planType,
          status: "Paid",
          invoiceUrl: null,
          invoicePdf: null,
        });
      }
    }

    // Sort by date (newest first)
    transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    return success(transactions);
  } catch (error: any) {
    console.error("Failed to fetch transactions:", {
      message: error.message,
      type: error.type,
    });

    if (error.statusCode === 401 || error.message?.includes("session")) {
      return unauthorized(error.message || "Authentication required");
    }

    return fail(
      error.message || "Failed to fetch transaction history",
      "TRANSACTION_ERROR",
      500
    );
  }
}
