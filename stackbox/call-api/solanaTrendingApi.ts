import { Connection, PublicKey } from "@solana/web3.js"
import { SOLANA_RPC_ENDPOINT } from "./dexConfig"

export interface TrendingToken {
  mint: string
  volume24h: number
  holders: number
}

export async function fetchTrendingSolanaTokens(
  limit: number = 10
): Promise<TrendingToken[]> {
  const conn = new Connection(SOLANA_RPC_ENDPOINT)
  const accounts = await conn.getProgramAccounts(new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"))
  return Promise.all(
    accounts.slice(0, limit).map(async ({ pubkey }) => {
      const balanceInfo = await conn.getTokenAccountBalance(pubkey)
      const holders = (await conn.getTokenLargestAccounts(pubkey)).value.length
      return {
        mint: pubkey.toBase58(),
        volume24h: Number(balanceInfo.value.uiAmount || 0),
        holders,
      }
    })
  )
}
