
export interface TokenLaunch {
  tokenId: string
  createdAt: number
  volumes: number[] 
}

export interface EmergingToken {
  tokenId: string
  ageHours: number
  recentVolume: number
  growthRate: number
  volatility: number
}

export function computeAgeHours(createdAt: number): number {
  return Math.floor((Date.now() - createdAt) / (1000 * 60 * 60))
}

export function sumLastN(values: number[], n: number): number {
  return values.slice(-n).reduce((a, b) => a + b, 0)
}

export function computeGrowthRate(values: number[], n: number): number {
  const recent = sumLastN(values, n)
  const prior = sumLastN(values.slice(0, -n), n) || 1
  return Math.round((recent / prior) * 1e4) / 1e4
}

export function computeVolatility(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length || 0
  const variance = values
    .map(v => (v - mean) ** 2)
    .reduce((a, b) => a + b, 0) / values.length
  return Math.round(Math.sqrt(variance) * 1e4) / 1e4
}

export function scanEmergingTokens(
  tokens: TokenLaunch[],
  minAge: number,
  windowSize: number,
  growthThreshold: number
): EmergingToken[] {
  const emerging: EmergingToken[] = []
  for (const t of tokens) {
    const age = computeAgeHours(t.createdAt)
    if (age < minAge) continue
    const growth = computeGrowthRate(t.volumes, windowSize)
    if (growth < growthThreshold) continue
    const recentVol = sumLastN(t.volumes, windowSize)
    const volat = computeVolatility(t.volumes.slice(-windowSize))
    emerging.push({
      tokenId: t.tokenId,
      ageHours: age,
      recentVolume: recentVol,
      growthRate: growth,
      volatility: volat,
    })
  }
  return emerging.sort((a, b) => b.growthRate - a.growthRate)
}
