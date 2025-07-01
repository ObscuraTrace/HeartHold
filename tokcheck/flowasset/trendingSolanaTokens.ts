import { Connection, PublicKey } from "@solana/web3.js"
import { SOLANA_RPC_ENDPOINT } from "./dexConfig"

export interface TrendingToken {
  mint: string
  volume24h: number
  priceChange24h: number
  holders: number
}

export async function fetchTrendingSolanaTokens(
  limit: number = 10
): Promise<TrendingToken[]> {
  const conn = new Connection(SOLANA_RPC_ENDPOINT)
  const pairs = await conn.getProgramAccounts(new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"))
  const slice = pairs.slice(0, limit)

  return Promise.all(
    slice.map(async ({ pubkey, account }) => {
      const balanceInfo = await conn.getTokenAccountBalance(pubkey)
      const holders = await conn.getTokenLargestAccounts(pubkey).then(r => r.value.length)
      // Note: priceChange24h must come from an off-chain source; placeholder 0
      return {
        mint: pubkey.toBase58(),
        volume24h: Number(balanceInfo.value.uiAmount || 0),
        priceChange24h: 0,
        holders,
      }
    })
  )
}
