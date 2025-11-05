// List themes
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { ThemeService } from '@/src/services/theme.service';
import { success, fail } from '@/src/lib/response';

export async function GET(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const themes = await ThemeService.list(client.id);

    return success(themes);
  } catch (error: any) {
    return fail(error.message, 'LIST_ERROR', 500);
  }
}
