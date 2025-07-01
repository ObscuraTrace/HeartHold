import { BlobServiceClient, ContainerClient, BlockBlobClient } from "@azure/storage-blob"

export function getContainerClient(connectionString: string, containerName: string): ContainerClient {
  const serviceClient = BlobServiceClient.fromConnectionString(connectionString)
  return serviceClient.getContainerClient(containerName)
}

export function getBlockBlobClient(connectionString: string, containerName: string, blobName: string): BlockBlobClient {
  const container = getContainerClient(connectionString, containerName)
  return container.getBlockBlobClient(blobName)
}
