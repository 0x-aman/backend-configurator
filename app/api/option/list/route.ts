// List options for category
import { NextRequest } from 'next/server';
import { OptionService } from '@/src/services/option.service';
import { success, fail } from '@/src/lib/response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    if (!categoryId) {
      return fail('Category ID is required', 'VALIDATION_ERROR');
    }

    const options = await OptionService.list(categoryId);

    return success(options);
  } catch (error: any) {
    return fail(error.message, 'LIST_ERROR', 500);
  }
}
