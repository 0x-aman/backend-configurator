// List all configurators for client
import { NextRequest } from 'next/server';
import { flexibleAuth } from '@/src/middleware/flexible-auth';
import { ConfiguratorService } from '@/src/services/configurator.service';
import { successWithCors, failWithCors } from '@/src/lib/response';

export async function GET(request: NextRequest) {
  try {
    // ✅ Now accepts both session and token authentication
    const { client } = await flexibleAuth(request);
    const configurators = await ConfiguratorService.list(client.id);

    return successWithCors(request, configurators);
  } catch (error: any) {
    return failWithCors(request, error.message, 'LIST_ERROR', 500);
  }
}
