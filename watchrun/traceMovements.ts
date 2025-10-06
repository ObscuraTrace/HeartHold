export interface TransferRecord {
  timestamp: number
  from: string
  to: string
  amount: number
}

export interface WhaleStats {
  address: string
  totalSent: number
  totalReceived: number
  firstActivity: number
  lastActivity: number
  averageAmount: number
}


export function groupByAddress(records: TransferRecord[]): Map<string, TransferRecord[]> {
  const map = new Map<string, TransferRecord[]>()

  for (const r of records) {
    if (r.amount <= 0) continue

    if (!map.has(r.from)) map.set(r.from, [])
    map.get(r.from)!.push(r)

    if (r.from !== r.to) {
      if (!map.has(r.to)) map.set(r.to, [])
      map.get(r.to)!.push(r)
    }
  }

  return map
}

function buildWhaleStats(addr: string, recs: TransferRecord[], minThreshold: number): WhaleStats | null {
  const filtered = recs.filter(r => r.amount >= minThreshold)
  if (filtered.length === 0) return null

  let totalSent = 0
  let totalReceived = 0
  const timestamps: number[] = []

  for (const r of filtered) {
    if (r.from === addr) totalSent += r.amount
    if (r.to === addr) totalReceived += r.amount
    timestamps.push(r.timestamp)
  }

  const firstActivity = Math.min(...timestamps)
  const lastActivity = Math.max(...timestamps)
  const averageAmount = Math.round(((totalSent + totalReceived) / filtered.length) * 100) / 100

  return {
    address: addr,
    totalSent,
    totalReceived,
    firstActivity,
    lastActivity,
    averageAmount,
  }
}


export function analyzeWhaleMovements(
  records: TransferRecord[],
  minThreshold: number
): WhaleStats[] {
  const grouped = groupByAddress(records)
  const result: WhaleStats[] = []

  for (const [address, recs] of grouped.entries()) {
    const stats = buildWhaleStats(address, recs, minThreshold)
    if (stats) result.push(stats)
  }

  return result.sort(
    (a, b) => (b.totalSent + b.totalReceived) - (a.totalSent + a.totalReceived)
  )
}
