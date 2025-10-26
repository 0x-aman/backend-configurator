// File service for AWS S3 uploads
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma } from '@/src/lib/prisma';
import { env } from '@/src/config/env';
import { NotFoundError } from '@/src/lib/errors';
import type { File as FileModel, FileType } from '@prisma/client';
import { generateId } from '@/src/utils/id';

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

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
    const fileId = generateId();
    const ext = file.originalName.split('.').pop();
    const filename = `${fileId}.${ext}`;
    const key = `clients/${clientId}/${filename}`;

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.AWS_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimeType,
      })
    );

    const url = `https://${env.AWS_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

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
        key,
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

    // Delete from S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: env.AWS_BUCKET,
        Key: file.key,
      })
    );

    // Delete from database
    await prisma.file.delete({ where: { id } });
  },

  async getSignedUploadUrl(
    clientId: string,
    filename: string,
    contentType: string
  ): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
    const fileId = generateId();
    const key = `clients/${clientId}/${fileId}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: env.AWS_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const fileUrl = `https://${env.AWS_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, fileUrl, key };
  },
};
