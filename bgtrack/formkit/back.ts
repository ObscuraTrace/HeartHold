import { Connection, PublicKey } from "@solana/web3.js"

interface SweepResult {
  token: string
  suspiciousSources: string[]
  sybilScore: number
}

export async function runSybilSweep(
  connection: Connection,
  mintAddress: string,
  minTransfers: number = 4
): Promise<SweepResult> {
  const mint = new PublicKey(mintAddress)
  const programId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")

  const latestSlot = await connection.getSlot()
  const suspiciousSources = new Set<string>()
  let totalLinkedRecipients = 0

  for (let offset = 0; offset < 100; offset++) {
    const slot = latestSlot - offset
    const block = await connection.getBlock(slot, {
      maxSupportedTransactionVersion: 0,
    }).catch(() => null)

    if (!block?.transactions) continue

    const transferMap = new Map<string, Set<string>>() // sender → recipients

    for (const tx of block.transactions) {
      for (const ix of tx.transaction.message.instructions) {
        if (!("parsed" in ix)) continue
        if (!ix.programId.equals(programId)) continue
        if (ix.parsed?.type !== "transfer") continue

        const info = ix.parsed.info
        if (info.mint !== mint.toBase58()) continue

        const sender = info.source
        const recipient = info.destination

        if (!transferMap.has(sender)) transferMap.set(sender, new Set())
        transferMap.get(sender)!.add(recipient)
      }
    }

    for (const [sender, recipients] of transferMap.entries()) {
      if (recipients.size >= minTransfers) {
        suspiciousSources.add(sender)
        totalLinkedRecipients += recipients.size
      }
    }
  }

  const score = Math.min(100, suspiciousSources.size * 10 + totalLinkedRecipients * 0.5)

  return {
    token: mint.toBase58(),
    suspiciousSources: Array.from(suspiciousSources),
    sybilScore: Math.round(score * 100) / 100,
  }
}
