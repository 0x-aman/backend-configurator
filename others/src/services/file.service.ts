// File service for Azure Blob Storage uploads
import { getBlockBlobClient, getContainerClient, ensureContainerExists } from '@/lib/azure-blob';
import { generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } from '@azure/storage-blob';
import { prisma } from '@/src/lib/prisma';
import { env } from '@/src/config/env';
import { NotFoundError } from '@/src/lib/errors';
import type { File as FileModel, FileType } from '@prisma/client';
import { generateId } from '@/src/utils/id';

export const FileService = {
  async upload(
    clientId: string,
    file: {
      buffer: Buffer;
      originalName: string;
      mimeType: string;
      size: number;
    }
  ): Promise<FileModel> {
    await ensureContainerExists();

    const fileId = generateId();
    const ext = file.originalName.split('.').pop();
    const filename = `${fileId}.${ext}`;
    const blobName = `clients/${clientId}/${filename}`;

    // Upload to Azure Blob Storage
    const blockBlobClient = getBlockBlobClient(blobName);
    await blockBlobClient.upload(file.buffer, file.buffer.length, {
      blobHTTPHeaders: {
        blobContentType: file.mimeType,
      },
    });

    const url = blockBlobClient.url;

    // Determine file type
    let fileType: FileType = 'OTHER';
    if (file.mimeType.startsWith('image/')) fileType = 'IMAGE';
    else if (file.mimeType.startsWith('application/pdf') || file.mimeType.includes('document')) {
      fileType = 'DOCUMENT';
    }

    // Save to database
    return await prisma.file.create({
      data: {
        clientId,
        filename,
        originalName: file.originalName,
        fileType,
        mimeType: file.mimeType,
        size: file.size,
        key: blobName,
        url,
      },
    });
  },

  async list(clientId: string, fileType?: FileType): Promise<FileModel[]> {
    return await prisma.file.findMany({
      where: {
        clientId,
        ...(fileType && { fileType }),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string): Promise<FileModel> {
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundError('File');
    return file;
  },

  async delete(id: string): Promise<void> {
    const file = await this.getById(id);

    // Delete from Azure Blob Storage
    const blockBlobClient = getBlockBlobClient(file.key);
    await blockBlobClient.deleteIfExists();

    // Delete from database
    await prisma.file.delete({ where: { id } });
  },

  async getSignedUploadUrl(
    clientId: string,
    filename: string,
    contentType: string
  ): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
    await ensureContainerExists();

    const fileId = generateId();
    const blobName = `clients/${clientId}/${fileId}-${filename}`;

    const blockBlobClient = getBlockBlobClient(blobName);

    // Generate SAS token for upload (valid for 1 hour)
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: env.AZURE_CONTAINER_NAME,
        blobName: blobName,
        permissions: BlobSASPermissions.parse("cw"), // create, write
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
      },
      getCredential()
    ).toString();

    const uploadUrl = `${blockBlobClient.url}?${sasToken}`;
    const fileUrl = blockBlobClient.url;

    return { uploadUrl, fileUrl, key: blobName };
  },
};

function getCredential(): StorageSharedKeyCredential {
  // Parse connection string to extract account name and key
  const connectionString = env.AZURE_STORAGE_CONNECTION_STRING;
  const accountNameMatch = connectionString.match(/AccountName=([^;]+)/);
  const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);

  if (!accountNameMatch || !accountKeyMatch) {
    throw new Error('Invalid Azure Storage connection string');
  }

  return new StorageSharedKeyCredential(
    accountNameMatch[1],
    accountKeyMatch[1]
  );
}
