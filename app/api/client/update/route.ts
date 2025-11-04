// Update client profile
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { ClientService } from '@/src/services/client.service';
import { hashPassword, verifyPassword } from '@/src/lib/auth';
import { success, fail } from '@/src/lib/response';
import { sanitizeText } from '@/src/utils/sanitize';

export async function PUT(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const body = await request.json();

    const { name, companyName, phone, avatarUrl, currentPassword, newPassword } = body;

    // Handle password change
    if (currentPassword && newPassword) {
      if (!client.passwordHash) {
        return fail('No password is set for this account', 'VALIDATION_ERROR', 400);
      }

      const isValid = await verifyPassword(currentPassword, client.passwordHash);
      if (!isValid) {
        return fail('Current password is incorrect', 'VALIDATION_ERROR', 400);
      }

      if (newPassword.length < 8) {
        return fail('New password must be at least 8 characters', 'VALIDATION_ERROR', 400);
      }

      const passwordHash = await hashPassword(newPassword);
      await ClientService.update(client.id, { passwordHash });
      
      return success({ message: 'Password updated successfully' }, 'Password updated');
    }

    // ✅ Fixed: Sanitize inputs before saving
    const sanitizedData: any = {};
    
    if (name !== undefined) {
      sanitizedData.name = sanitizeText(name);
    }
    if (companyName !== undefined) {
      sanitizedData.companyName = companyName ? sanitizeText(companyName) : null;
    }
    if (phone !== undefined) {
      sanitizedData.phone = phone ? sanitizeText(phone) : null;
    }
    if (avatarUrl !== undefined) {
      sanitizedData.avatarUrl = avatarUrl;
    }

    // Handle profile update
    const updated = await ClientService.update(client.id, sanitizedData);

    const safeClient = await ClientService.getSafeClient(updated.id);
    return success(safeClient, 'Profile updated');
  } catch (error: any) {
    console.error('Update client error:', error);
    return fail(error.message, 'UPDATE_ERROR', 500);
  }
}
