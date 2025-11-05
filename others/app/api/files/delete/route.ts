// Delete file
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { FileService } from '@/src/services/file.service';
import { success, fail } from '@/src/lib/response';

export async function DELETE(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return fail('File ID is required', 'VALIDATION_ERROR');
    }

    await FileService.delete(id);

    return success(null, 'File deleted');
  } catch (error: any) {
    return fail(error.message, 'DELETE_ERROR', 500);
  }
}
