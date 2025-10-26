// Create theme
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { ThemeService } from '@/src/services/theme.service';
import { success, fail, created } from '@/src/lib/response';

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();

    const theme = await ThemeService.create(client.id, body);

    return created(theme, 'Theme created');
  } catch (error: any) {
    return fail(error.message, 'CREATE_ERROR', 500);
  }
}
