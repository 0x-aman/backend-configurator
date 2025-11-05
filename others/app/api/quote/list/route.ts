// List quotes for client
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { QuoteService } from '@/src/services/quote.service';
import { success, fail } from '@/src/lib/response';

export async function GET(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status') as any;
    const configuratorId = searchParams.get('configuratorId') || undefined;

    const quotes = await QuoteService.list(client.id, {
      status,
      configuratorId,
    });

    return success(quotes);
  } catch (error: any) {
    return fail(error.message, 'LIST_ERROR', 500);
  }
}
