
import type { ContainerClient, BlockBlobClient } from "@azure/storage-blob"
import { ensureContainer, getBlockBlobClient } from "./blobClient"

export class StorageService {
  constructor(private connectionString: string, private containerName: string) {}

  async upload(blobName: string, data: Buffer | string): Promise<string> {
    const container = await ensureContainer(this.connectionString, this.containerName)
    const client: BlockBlobClient = container.getBlockBlobClient(blobName)
    const result = await client.upload(data, typeof data === "string" ? Buffer.byteLength(data) : data.byteLength)
    return result.requestId
  }

  async download(blobName: string): Promise<Buffer> {
    const client = getBlockBlobClient(this.connectionString, this.containerName, blobName)
    const download = await client.download()
    return Buffer.from(await download.arrayBuffer())
  }

  async list(prefix?: string): Promise<string[]> {
    const container: ContainerClient = await ensureContainer(this.connectionString, this.containerName)
    const names: string[] = []
    for await (const blob of container.listBlobsFlat({ prefix })) {
      names.push(blob.name)
    }
    return names
  }

  async delete(blobName: string): Promise<boolean> {
    const client = getBlockBlobClient(this.connectionString, this.containerName, blobName)
    const result = await client.deleteIfExists()
    return result.succeeded
  }
}
