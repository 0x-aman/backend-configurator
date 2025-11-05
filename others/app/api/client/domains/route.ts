// Manage allowed domains
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { ClientService } from '@/src/services/client.service';
import { success, fail } from '@/src/lib/response';

export async function GET(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    return success({ domains: client.allowedDomains });
  } catch (error: any) {
    return fail(error.message, 'DOMAINS_ERROR', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();
    const { domains } = body;

    if (!Array.isArray(domains)) {
      return fail('Domains must be an array', 'VALIDATION_ERROR');
    }

    const updated = await ClientService.updateAllowedDomains(client.id, domains);
    return success({ domains: updated.allowedDomains }, 'Domains updated');
  } catch (error: any) {
    return fail(error.message, 'UPDATE_ERROR', 500);
  }
}
