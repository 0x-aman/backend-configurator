// Update client profile
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { ClientService } from '@/src/services/client.service';
import { success, fail } from '@/src/lib/response';

export async function PUT(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();

    const { name, companyName, phone, avatarUrl } = body;

    const updated = await ClientService.update(client.id, {
      name,
      companyName,
      phone,
      avatarUrl,
    });

    const safeClient = await ClientService.getSafeClient(updated.id);
    return success(safeClient, 'Profile updated');
  } catch (error: any) {
    return fail(error.message, 'UPDATE_ERROR', 500);
  }
}
