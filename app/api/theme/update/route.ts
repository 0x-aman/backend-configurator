// Update/Delete theme
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { ThemeService } from '@/src/services/theme.service';
import { success, fail } from '@/src/lib/response';

export async function PUT(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return fail('Theme ID is required', 'VALIDATION_ERROR');
    }

    const theme = await ThemeService.update(id, data);

    return success(theme, 'Theme updated');
  } catch (error: any) {
    return fail(error.message, 'UPDATE_ERROR', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return fail('Theme ID is required', 'VALIDATION_ERROR');
    }

    await ThemeService.delete(id);

    return success(null, 'Theme deleted');
  } catch (error: any) {
    return fail(error.message, 'DELETE_ERROR', 500);
  }
}
