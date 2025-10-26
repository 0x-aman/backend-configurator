// Create category
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { CategoryService } from '@/src/services/category.service';
import { ConfiguratorService } from '@/src/services/configurator.service';
import { success, fail, created } from '@/src/lib/response';

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();

    const { configuratorId, name, categoryType, description, isPrimary, isRequired } = body;

    if (!configuratorId || !name) {
      return fail('Configurator ID and name are required', 'VALIDATION_ERROR');
    }

    // Verify ownership
    await ConfiguratorService.getById(configuratorId, client.id);

    const category = await CategoryService.create(configuratorId, {
      name,
      categoryType,
      description,
      isPrimary,
      isRequired,
    });

    return created(category, 'Category created');
  } catch (error: any) {
    return fail(error.message, 'CREATE_ERROR', error.statusCode || 500);
  }
}
