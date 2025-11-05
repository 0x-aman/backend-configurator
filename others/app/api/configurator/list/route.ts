// List all configurators for client
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { ConfiguratorService } from '@/src/services/configurator.service';
import { success, fail } from '@/src/lib/response';

export async function GET(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const configurators = await ConfiguratorService.list(client.id);

    return success(configurators);
  } catch (error: any) {
    return fail(error.message, 'LIST_ERROR', 500);
  }
}
