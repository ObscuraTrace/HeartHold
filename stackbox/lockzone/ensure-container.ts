
import type { ContainerClient } from "@azure/storage-blob"
import { getContainerClient } from "./blobClient"

export async function ensureContainer(connectionString: string, containerName: string): Promise<ContainerClient> {
  const container = getContainerClient(connectionString, containerName)
  const exists = await container.exists()
  if (!exists) {
    await container.create()
  }
  return container
}
