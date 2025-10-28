// Create configurator
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { ConfiguratorService } from '@/src/services/configurator.service';
import { success, fail, created } from '@/src/lib/response';
import { canCreateConfigurator } from '@/src/config/permissions';

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();

    const { name, description, currency, currencySymbol, themeId } = body;

    if (!name) {
      return fail('Name is required', 'VALIDATION_ERROR');
    }

    // Check plan limits based on subscription status
    const existingCount = await ConfiguratorService.list(client.id).then(list => list.length);
    if (!canCreateConfigurator(client.subscriptionStatus, existingCount)) {
      return fail('Configurator limit reached. Please upgrade your subscription to create more configurators.', 'LIMIT_EXCEEDED', 403);
    }

    const configurator = await ConfiguratorService.create(client.id, {
      name,
      description,
      currency,
      currencySymbol,
      themeId,
    });

    return created(configurator, 'Configurator created');
  } catch (error: any) {
    return fail(error.message, 'CREATE_ERROR', 500);
  }
}
