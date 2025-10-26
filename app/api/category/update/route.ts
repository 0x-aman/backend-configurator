// Update/Delete category
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { CategoryService } from '@/src/services/category.service';
import { success, fail } from '@/src/lib/response';

export async function PUT(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return fail('Category ID is required', 'VALIDATION_ERROR');
    }

    const category = await CategoryService.update(id, data);

    return success(category, 'Category updated');
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
      return fail('Category ID is required', 'VALIDATION_ERROR');
    }

    await CategoryService.delete(id);

    return success(null, 'Category deleted');
  } catch (error: any) {
    return fail(error.message, 'DELETE_ERROR', 500);
  }
}
