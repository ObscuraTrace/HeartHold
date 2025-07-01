
export interface PricePoint {
  timestamp: number
  price: number
  volume?: number
}

export interface MarketMetrics {
  averagePrice: number
  totalVolume?: number
  priceStdDev: number
  maxDrawdown: number
  momentumSeries: number[]
  volatilitySeries: number[]
}

export function computeAveragePrice(data: PricePoint[]): number {
  const sum = data.reduce((acc, p) => acc + p.price, 0)
  return data.length ? sum / data.length : 0
}

export function computeTotalVolume(data: PricePoint[]): number | undefined {
  if (data.every(p => p.volume == null)) return undefined
  return data.reduce((acc, p) => acc + (p.volume || 0), 0)
}

export function computePriceStdDev(data: PricePoint[]): number {
  const avg = computeAveragePrice(data)
  const variance =
    data.reduce((acc, p) => acc + (p.price - avg) ** 2, 0) /
    (data.length || 1)
  return Math.sqrt(variance)
}

export function computeMaxDrawdown(data: PricePoint[]): number {
  let peak = data[0]?.price ?? 0
  let maxDD = 0
  for (const { price } of data) {
    if (price > peak) peak = price
    const dd = (peak - price) / peak
    if (dd > maxDD) maxDD = dd
  }
  return maxDD
}

export function computeMomentumSeries(
  data: PricePoint[],
  window: number
): number[] {
  const series: number[] = []
  for (let i = window; i < data.length; i++) {
    const prev = data[i - window].price
    const curr = data[i].price
    series.push(prev > 0 ? (curr - prev) / prev : 0)
  }
  return series
}

export function computeVolatilitySeries(
  data: PricePoint[],
  window: number
): number[] {
  const series: number[] = []
  for (let i = window; i < data.length; i++) {
    const slice = data.slice(i - window, i)
    const std = computePriceStdDev(slice)
    series.push(std)
  }
  return series
}

export function analyzeMarket(
  data: PricePoint[],
  window: number
): MarketMetrics {
  return {
    averagePrice: computeAveragePrice(data),
    totalVolume: computeTotalVolume(data),
    priceStdDev: computePriceStdDev(data),
    maxDrawdown: computeMaxDrawdown(data),
    momentumSeries: computeMomentumSeries(data, window),
    volatilitySeries: computeVolatilitySeries(data, window),
  }
}