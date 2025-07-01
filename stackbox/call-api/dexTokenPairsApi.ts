import { DEX_API_BASE, DEFAULT_HEADERS, FETCH_TIMEOUT_MS } from "./dexConfig"

export interface TokenPair {
  baseSymbol: string
  quoteSymbol: string
  pairAddress: string
  liquidity: number
}

export async function fetchDexTokenPairs(
  chain: string,
  minLiquidity: number = 0
): Promise<TokenPair[]> {
  const url = `${DEX_API_BASE}/chains/${chain}/pairs`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, { headers: DEFAULT_HEADERS, signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as any[]
    return data
      .filter(p => p.liquidity >= minLiquidity)
      .map(p => ({
        baseSymbol: p.base.symbol,
        quoteSymbol: p.quote.symbol,
        pairAddress: p.address,
        liquidity: p.liquidity,
      }))
  } finally {
    clearTimeout(timer)
  }
}