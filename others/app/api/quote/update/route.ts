// Update quote
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { QuoteService } from '@/src/services/quote.service';
import { success, fail } from '@/src/lib/response';

export async function PUT(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();

    const { id, ...data } = body;

    if (!id) {
      return fail('Quote ID is required', 'VALIDATION_ERROR');
    }

    const quote = await QuoteService.update(id, data);

    return success(quote, 'Quote updated');
  } catch (error: any) {
    return fail(error.message, 'UPDATE_ERROR', 500);
  }
}
