// File upload with flexible authentication
import { NextRequest } from 'next/server';
import { flexibleAuth } from '@/src/middleware/flexible-auth';
import { FileService } from '@/src/services/file.service';
import { success, fail, created } from '@/src/lib/response';

export async function POST(request: NextRequest) {
  try {
    const { client } = await flexibleAuth(request);
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

// Get signed upload URL for direct Azure Blob Storage upload
export async function GET(request: NextRequest) {
  try {
    const { client } = await flexibleAuth(request);
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
