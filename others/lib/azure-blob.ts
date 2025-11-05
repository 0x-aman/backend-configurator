// Azure Blob Storage client configuration
import { BlobServiceClient, ContainerClient, BlockBlobClient } from "@azure/storage-blob";
import { env } from "@/src/config/env";

let blobServiceClient: BlobServiceClient;
let containerClient: ContainerClient;

export function getBlobServiceClient(): BlobServiceClient {
  if (!blobServiceClient) {
    blobServiceClient = BlobServiceClient.fromConnectionString(
      env.AZURE_STORAGE_CONNECTION_STRING
    );
  }
  return blobServiceClient;
}

export function getContainerClient(): ContainerClient {
  if (!containerClient) {
    const blobService = getBlobServiceClient();
    containerClient = blobService.getContainerClient(env.AZURE_CONTAINER_NAME);
  }
  return containerClient;
}

export function getBlockBlobClient(blobName: string): BlockBlobClient {
  const container = getContainerClient();
  return container.getBlockBlobClient(blobName);
}

export async function ensureContainerExists(): Promise<void> {
  try {
    const container = getContainerClient();
    await container.createIfNotExists({
      access: 'blob', // Public read access for blobs
    });
  } catch (error) {
    console.error('Failed to create container:', error);
    throw error;
  }
}

export default {
  getBlobServiceClient,
  getContainerClient,
  getBlockBlobClient,
  ensureContainerExists,
};
