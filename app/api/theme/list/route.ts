// List themes
import { NextRequest } from 'next/server';
import { flexibleAuth } from '@/src/middleware/flexible-auth';
import { ThemeService } from '@/src/services/theme.service';
import { successWithCors, failWithCors } from '@/src/lib/response';

export async function GET(request: NextRequest) {
  try {
    // ✅ Now accepts both session and token authentication
    const { client } = await flexibleAuth(request);
    const themes = await ThemeService.list(client.id);

    return successWithCors(request, themes);
  } catch (error: any) {
    return failWithCors(request, error.message, 'LIST_ERROR', 500);
  }
}
