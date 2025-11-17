// Delete file with flexible authentication
import { NextRequest } from 'next/server';
import { flexibleAuth } from '@/src/middleware/flexible-auth';
import { FileService } from '@/src/services/file.service';
import { success, fail, notFound, unauthorized } from '@/src/lib/response';
import { prisma } from '@/src/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const { client } = await flexibleAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return fail('File ID is required', 'VALIDATION_ERROR');
    }

    // Verify file ownership
    const file = await prisma.file.findUnique({
      where: { id },
      select: { id: true, clientId: true },
    });

    if (!file) {
      return notFound('File not found');
    }

    if (file.clientId !== client.id) {
      return unauthorized('You do not own this file');
    }

    await FileService.delete(id);

    return success(null, 'File deleted');
  } catch (error: any) {
    return fail(error.message, 'DELETE_ERROR', 500);
  }
}
