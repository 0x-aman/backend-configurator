// Get transaction history from Stripe
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { stripe } from '@/src/lib/stripe';
import { success, fail } from '@/src/lib/response';

export async function GET(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);

    if (!client.stripeCustomerId) {
      return success([]);
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: client.stripeCustomerId,
      limit: 100,
    });

    // Transform invoices to transaction format
    const transactions = invoices.data.map((invoice) => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000),
      amount: invoice.total / 100, // Convert from cents to euros
      currency: invoice.currency.toUpperCase(),
      planType: invoice.lines.data[0]?.price?.recurring?.interval === 'year' ? 'Yearly' : 'Monthly',
      status: invoice.status === 'paid' ? 'Paid' : invoice.status === 'open' ? 'Pending' : 'Failed',
      invoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
    }));

    return success(transactions);
  } catch (error: any) {
    console.error('Failed to fetch transactions:', error);
    return fail(error.message, 'TRANSACTION_ERROR', 500);
  }
}
