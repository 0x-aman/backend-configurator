// Update configurator
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { ConfiguratorService } from '@/src/services/configurator.service';
import { success, fail } from '@/src/lib/response';

export async function PUT(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();

    const { id, ...data } = body;

    if (!id) {
      return fail('Configurator ID is required', 'VALIDATION_ERROR');
    }

    const configurator = await ConfiguratorService.update(id, client.id, data);

    return success(configurator, 'Configurator updated');
  } catch (error: any) {
    return fail(error.message, 'UPDATE_ERROR', error.statusCode || 500);
  }
}
