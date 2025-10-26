// List categories for configurator
import { NextRequest } from 'next/server';
import { CategoryService } from '@/src/services/category.service';
import { success, fail } from '@/src/lib/response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configuratorId = searchParams.get('configuratorId');

    if (!configuratorId) {
      return fail('Configurator ID is required', 'VALIDATION_ERROR');
    }

    const categories = await CategoryService.list(configuratorId);

    return success(categories);
  } catch (error: any) {
    return fail(error.message, 'LIST_ERROR', 500);
  }
}
