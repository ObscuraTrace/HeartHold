
export interface TransactionRecord {
  timestamp: number
  from: string
  to: string
  amount: number
}

export interface TransactionMetrics {
  totalVolume: number
  txCount: number
  averageValue: number
  hourlyRate: Record<string, number>
}

export function summarizeTransactions(
  records: TransactionRecord[],
  intervalMs: number
): TransactionMetrics {
  const totalVolume = records.reduce((acc, r) => acc + r.amount, 0)
  const txCount = records.length
  const averageValue = txCount ? totalVolume / txCount : 0

  const buckets: Record<string, number> = {}
  for (const r of records) {
    const bucket = Math.floor(r.timestamp / intervalMs) * intervalMs
    buckets[bucket] = (buckets[bucket] || 0) + 1
  }

  // convert numeric keys to ISO strings
  const hourlyRate: Record<string, number> = {}
  for (const [k, v] of Object.entries(buckets)) {
    hourlyRate[new Date(+k).toISOString()] = v
  }

  return { totalVolume, txCount, averageValue, hourlyRate }
}

export function filterByAddress(
  records: TransactionRecord[],
  address: string
): TransactionRecord[] {
  return records.filter(r => r.from === address || r.to === address)
}

export function computeNetFlow(
  records: TransactionRecord[]
): Record<string, number> {
  const flow: Record<string, number> = {}
  for (const r of records) {
    flow[r.from] = (flow[r.from] || 0) - r.amount
    flow[r.to] = (flow[r.to] || 0) + r.amount
  }
  return flow
}