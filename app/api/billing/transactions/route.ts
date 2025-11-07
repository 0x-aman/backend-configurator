// src/app/api/transactions/route.ts
// --------------------------------------------------------------
// Fetch a client's full transaction history from Stripe,
// combining subscription invoices and one-time payments
// while deduplicating overlapping payment intents.
// --------------------------------------------------------------

import { NextRequest } from "next/server";
import { authenticateRequest } from "@/src/middleware/auth";
import { stripe } from "@/src/lib/stripe";
import { prisma } from "@/src/lib/prisma";
import { success, fail, unauthorized } from "@/src/lib/response";

// Type-safe transaction object
interface Transaction {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  planType: string;
  status: "Paid" | "Pending" | "Failed";
  invoiceUrl: string | null;
  invoicePdf: string | null;
}

// Limit constants for API safety
const STRIPE_FETCH_LIMIT = 100;

export async function GET(request: NextRequest) {
  try {
    // Step 1: Verify and identify the client
    const client = await authenticateRequest(request);
    if (!client?.stripeCustomerId) {
      console.warn(`Client ${client?.id} has no Stripe customer ID.`);
      return success([]);
    }

    console.info(
      `[Billing] Fetching transactions for client ${client.id} (${client.email})`
    );

    // Step 2: Fetch invoices and payment intents in parallel
    const [invoices, paymentIntents] = await Promise.all([
      stripe.invoices.list({
        customer: client.stripeCustomerId,
        limit: STRIPE_FETCH_LIMIT,
      }),
      stripe.paymentIntents.list({
        customer: client.stripeCustomerId,
        limit: STRIPE_FETCH_LIMIT,
      }),
    ]);

    console.info(
      `[Billing] Found ${invoices.data.length} invoices and ${paymentIntents.data.length} payment intents for client ${client.id}`
    );

    const transactions: Transaction[] = [];
    const seenPaymentIntents = new Set<string>();

    // Step 3: Map invoices → transactions (for subscriptions)
    for (const invoice of invoices.data) {
      if (!invoice) continue;

      const linkedPaymentIntent =
        typeof invoice.payment_intent === "string"
          ? invoice.payment_intent
          : invoice.payment_intent?.id;

      if (linkedPaymentIntent) seenPaymentIntents.add(linkedPaymentIntent);

      const recurringType =
        invoice.lines.data[0]?.price?.recurring?.interval ?? null;

      transactions.push({
        id: invoice.id,
        date: new Date(invoice.created * 1000),
        amount: (invoice.total ?? 0) / 100,
        currency: (invoice.currency ?? "EUR").toUpperCase(),
        planType:
          recurringType === "year"
            ? "Yearly"
            : recurringType === "month"
              ? "Monthly"
              : "Subscription",
        status:
          invoice.status === "paid"
            ? "Paid"
            : invoice.status === "open"
              ? "Pending"
              : "Failed",
        invoiceUrl: invoice.hosted_invoice_url || null,
        invoicePdf: invoice.invoice_pdf || null,
      });
    }

    // Step 4: Map payment intents → transactions (for one-time payments)
    for (const payment of paymentIntents.data) {
      if (!payment) continue;

      // Skip any payment intents already represented by invoices
      if (seenPaymentIntents.has(payment.id)) continue;

      if (payment.status !== "succeeded") continue;

      // Default plan type
      let planType = "One-time Payment";

      // If metadata or description indicates option block purchase
      if (
        payment.metadata?.type === "OPTION_BLOCK" ||
        payment.description?.toLowerCase().includes("option capacity")
      ) {
        planType = "+10 Options";
      }

      // Optionally fetch audit log context
      const auditEvent = await prisma.auditBillingEvent.findFirst({
        where: {
          clientId: client.id,
          event: "OPTION_BLOCK_PURCHASED",
        },
        orderBy: { createdAt: "desc" },
      });

      // You could further enrich `planType` or attach audit info here if needed

      transactions.push({
        id: payment.id,
        date: new Date(payment.created * 1000),
        amount: (payment.amount ?? 0) / 100,
        currency: (payment.currency ?? "EUR").toUpperCase(),
        planType,
        status: "Paid",
        invoiceUrl: null,
        invoicePdf: null,
      });
    }

    // Step 5: Sort transactions (newest first)
    transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    console.info(
      `[Billing] Returning ${transactions.length} transactions for client ${client.id}`
    );

    return success(transactions);
  } catch (error: any) {
    console.error("[Billing] Transaction fetch failed:", {
      name: error.name,
      message: error.message,
      type: error.type,
      stack: error.stack,
    });

    if (error.statusCode === 401 || /session/i.test(error.message)) {
      return unauthorized(error.message || "Authentication required");
    }

    return fail(
      error.message || "Failed to fetch transaction history",
      "TRANSACTION_FETCH_ERROR",
      500
    );
  }
}
