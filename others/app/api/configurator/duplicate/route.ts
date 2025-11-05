// Duplicate configurator
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { ConfiguratorService } from '@/src/services/configurator.service';
import { success, fail, created } from '@/src/lib/response';

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return fail('Configurator ID is required', 'VALIDATION_ERROR');
    }

    const configurator = await ConfiguratorService.duplicate(id, client.id);

    return created(configurator, 'Configurator duplicated');
  } catch (error: any) {
    return fail(error.message, 'DUPLICATE_ERROR', error.statusCode || 500);
  }
}
