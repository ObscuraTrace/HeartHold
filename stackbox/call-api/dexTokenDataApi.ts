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
    const response = await fetch(url, {
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
    })

    if (!response.ok) {
      console.warn(`DEX API responded with status: ${response.status}`)
      return null
    }

    const data = await response.json()

    // Structural and type validation
    if (
      !data?.token0?.symbol ||
      typeof data.priceUsd !== "number" ||
      typeof data.volumeUsd24h !== "number" ||
      typeof data.liquidity !== "number" ||
      typeof data.priceChangeUsd24h !== "number"
    ) {
      console.warn("DEX API returned malformed data:", data)
      return null
    }

    return {
      symbol: data.token0.symbol,
      priceUsd: data.priceUsd,
      volumeUsd24h: data.volumeUsd24h,
      liquidity: data.liquidity,
      change24h: data.priceChangeUsd24h,
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.warn("DEX API request timed out")
    } else {
      console.error("DEX API request failed:", error)
    }
    return null
  } finally {
    clearTimeout(timer)
  }
}
