// Delete configurator
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { ConfiguratorService } from '@/src/services/configurator.service';
import { success, fail, noContent } from '@/src/lib/response';

export async function DELETE(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return fail('Configurator ID is required', 'VALIDATION_ERROR');
    }

    await ConfiguratorService.delete(id, client.id);

    return success(null, 'Configurator deleted');
  } catch (error: any) {
    return fail(error.message, 'DELETE_ERROR', error.statusCode || 500);
  }
}
