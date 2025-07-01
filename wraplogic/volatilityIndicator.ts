
export interface PriceTick {
  timestamp: number
  price: number
}

export interface VolatilityMetrics {
  stdDev: number
  avgTrueRange: number
  historicalVolatility: number
}

export function computeStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

export function computeATR(ticks: PriceTick[], period: number): number {
  if (ticks.length < 2) return 0
  const trueRanges: number[] = []
  for (let i = 1; i < ticks.length; i++) {
    const high = Math.max(ticks[i].price, ticks[i - 1].price)
    const low = Math.min(ticks[i].price, ticks[i - 1].price)
    trueRanges.push(high - low)
  }
  const slice = trueRanges.slice(-period)
  const sum = slice.reduce((a, b) => a + b, 0)
  return sum / slice.length
}

export function computeHistoricalVolatility(
  ticks: PriceTick[],
  period: number
): number {
  const logReturns: number[] = []
  for (let i = 1; i < ticks.length; i++) {
    logReturns.push(Math.log(ticks[i].price / ticks[i - 1].price))
  }
  return computeStandardDeviation(logReturns) * Math.sqrt(252)
}

export function analyzeVolatility(
  ticks: PriceTick[],
  atrPeriod: number,
  hvPeriod: number
): VolatilityMetrics {
  const prices = ticks.map(t => t.price)
  return {
    stdDev: Math.round(computeStandardDeviation(prices) * 1e6) / 1e6,
    avgTrueRange: Math.round(computeATR(ticks, atrPeriod) * 1e6) / 1e6,
    historicalVolatility: Math.round(computeHistoricalVolatility(ticks, hvPeriod) * 1e6) / 1e6,
  }
}
