// Email templates list
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { EmailTemplateService } from '@/src/services/email-template.service';
import { success, fail } from '@/src/lib/response';

export async function GET(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;

    const templates = await EmailTemplateService.list(client.id, type);

    return success(templates);
  } catch (error: any) {
    return fail(error.message, 'LIST_ERROR', 500);
  }
}
