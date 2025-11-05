// Get quote by code
import { NextRequest } from 'next/server';
import { QuoteService } from '@/src/services/quote.service';
import { success, fail } from '@/src/lib/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteCode: string }> }
) {
  try {
    const { quoteCode } = await params;
    const quote = await QuoteService.getByCode(quoteCode);

    // Track open
    await QuoteService.trackOpen(quoteCode);

    return success(quote);
  } catch (error: any) {
    return fail(error.message, 'QUOTE_ERROR', error.statusCode || 500);
  }
}
