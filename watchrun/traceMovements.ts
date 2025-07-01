// traceWhaleMovements.ts

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
    if (!map.has(r.to)) map.set(r.to, [])
    map.get(r.from)!.push(r)
    map.get(r.to)!.push(r)
  }
  return map
}

export function analyzeWhaleMovements(
  records: TransferRecord[],
  minThreshold: number
): WhaleStats[] {
  const byAddress = groupByAddress(records)
  const stats: WhaleStats[] = []
  for (const [addr, recs] of byAddress.entries()) {
    const filtered = recs.filter(r => r.amount >= minThreshold)
    if (!filtered.length) continue
    let sent = 0, received = 0
    const times: number[] = []
    for (const r of filtered) {
      if (r.from === addr) sent += r.amount
      if (r.to === addr) received += r.amount
      times.push(r.timestamp)
    }
    const first = Math.min(...times)
    const last = Math.max(...times)
    const avg = Math.round((sent + received) / filtered.length * 1e2) / 1e2
    stats.push({ address: addr, totalSent: sent, totalReceived: received, firstActivity: first, lastActivity: last, averageAmount: avg })
  }
  return stats.sort((a, b) => (b.totalSent + b.totalReceived) - (a.totalSent + a.totalReceived))
}
