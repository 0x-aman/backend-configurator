// File upload
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/src/middleware/auth';
import { FileService } from '@/src/services/file.service';
import { success, fail, created } from '@/src/lib/response';

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const formData = await request.formData();

    const file = formData.get('file') as File;
    if (!file) {
      return fail('File is required', 'VALIDATION_ERROR');
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadedFile = await FileService.upload(client.id, {
      buffer,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
    });

    return created(uploadedFile, 'File uploaded');
  } catch (error: any) {
    return fail(error.message, 'UPLOAD_ERROR', 500);
  }
}

// Get signed upload URL for direct S3 upload
export async function GET(request: NextRequest) {
  try {
    const client = await authenticateRequest(request);
    const { searchParams } = new URL(request.url);

    const filename = searchParams.get('filename');
    const contentType = searchParams.get('contentType');

    if (!filename || !contentType) {
      return fail('Filename and content type are required', 'VALIDATION_ERROR');
    }

    const signedUrl = await FileService.getSignedUploadUrl(client.id, filename, contentType);

    return success(signedUrl);
  } catch (error: any) {
    return fail(error.message, 'SIGNED_URL_ERROR', 500);
  }
}
