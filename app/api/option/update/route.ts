// Update/Delete option
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { OptionService } from '@/src/services/option.service';
import { success, fail } from '@/src/lib/response';

export async function PUT(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return fail('Option ID is required', 'VALIDATION_ERROR');
    }

    if (data.price !== undefined) {
      data.price = parseFloat(data.price);
    }

    const option = await OptionService.update(id, data);

    return success(option, 'Option updated');
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
      return fail('Option ID is required', 'VALIDATION_ERROR');
    }

    await OptionService.delete(id);

    return success(null, 'Option deleted');
  } catch (error: any) {
    return fail(error.message, 'DELETE_ERROR', 500);
  }
}
