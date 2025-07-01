
export interface ActivityRecord {
  address: string
  transfersIn: number
  transfersOut: number
  volumeIn: number
  volumeOut: number
  lastTimestamp: number
}

export interface SuspiciousAddress {
  address: string
  score: number
  reasons: string[]
}

export function detectSuspiciousActivity(
  records: ActivityRecord[],
  transferThreshold: number,
  volumeThreshold: number,
  timeWindowMs: number
): SuspiciousAddress[] {
  const now = Date.now()
  const results: SuspiciousAddress[] = []
  for (const r of records) {
    const age = now - r.lastTimestamp
    let score = 0
    const reasons: string[] = []
    if (r.transfersIn + r.transfersOut > transferThreshold) {
      score += 1
      reasons.push("high transfer count")
    }
    if (r.volumeIn + r.volumeOut > volumeThreshold) {
      score += 1
      reasons.push("high volume")
    }
    if (age < timeWindowMs) {
      score += 1
      reasons.push("recent activity")
    }
    if (score > 0) {
      results.push({ address: r.address, score, reasons })
    }
  }
  return results.sort((a, b) => b.score - a.score)
}
