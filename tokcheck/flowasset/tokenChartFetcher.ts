import { DEX_API_BASE, DEFAULT_HEADERS, FETCH_TIMEOUT_MS } from "./dexConfig"

export interface Candle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export async function fetchPairCandles(
  pairAddress: string,
  interval: string = "1h",       // e.g. “1m”, “5m”, “1h”, “1d”
  limit: number = 100
): Promise<Candle[]> {
  const url = `${DEX_API_BASE}/pair/${pairAddress}/candles?interval=${interval}&limit=${limit}`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, { headers: DEFAULT_HEADERS, signal: ctrl.signal })
    if (!res.ok) throw new Error(`Failed to fetch candles: ${res.status}`)
    const data = (await res.json()) as any[]
    return data.map(c => ({
      timestamp: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
    }))
  } finally {
    clearTimeout(timer)
  }
}
