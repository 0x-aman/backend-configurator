// Create option
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { OptionService } from '@/src/services/option.service';
import { success, fail, created } from '@/src/lib/response';

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();

    const { categoryId, label, description, price, sku, imageUrl, isDefault } = body;

    if (!categoryId || !label || price === undefined) {
      return fail('Category ID, label, and price are required', 'VALIDATION_ERROR');
    }

    const option = await OptionService.create(categoryId, {
      label,
      description,
      price: parseFloat(price),
      sku,
      imageUrl,
      isDefault,
    });

    return created(option, 'Option created');
  } catch (error: any) {
    return fail(error.message, 'CREATE_ERROR', 500);
  }
}
