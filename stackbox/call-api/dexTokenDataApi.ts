import { DEX_API_BASE, DEFAULT_HEADERS, FETCH_TIMEOUT_MS } from "./dexConfig"

export interface TokenData {
  symbol: string
  priceUsd: number
  volumeUsd24h: number
  liquidity: number
  change24h: number
}

export async function retrieveDexTokenData(
  pairAddress: string
): Promise<TokenData | null> {
  const url = `${DEX_API_BASE}/pair/${pairAddress}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, { headers: DEFAULT_HEADERS, signal: controller.signal })
    if (!res.ok) return null
    const json = await res.json()
    return {
      symbol: json.token0.symbol,
      priceUsd: json.priceUsd,
      volumeUsd24h: json.volumeUsd24h,
      liquidity: json.liquidity,
      change24h: json.priceChangeUsd24h,
    }
  } finally {
    clearTimeout(timer)
  }
}
