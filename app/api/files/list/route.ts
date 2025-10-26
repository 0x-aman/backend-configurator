// List files
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { FileService } from '@/src/services/file.service';
import { success, fail } from '@/src/lib/response';

export async function GET(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const { searchParams } = new URL(request.url);
    const fileType = searchParams.get('type') as any;

    const files = await FileService.list(client.id, fileType);

    return success(files);
  } catch (error: any) {
    return fail(error.message, 'LIST_ERROR', 500);
  }
}
