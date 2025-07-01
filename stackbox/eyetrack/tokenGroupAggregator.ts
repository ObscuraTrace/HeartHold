
export interface TransferRecord {
  token: string
  from: string
  to: string
  amount: number
  timestamp: number
}

export interface TokenGroupSummary {
  token: string
  totalTransferred: number
  uniqueSenders: number
  uniqueReceivers: number
}

export function groupByToken(records: TransferRecord[]): TokenGroupSummary[] {
  const map: Record<string, { transferred: number; senders: Set<string>; receivers: Set<string> }> = {}
  for (const r of records) {
    if (!map[r.token]) {
      map[r.token] = { transferred: 0, senders: new Set(), receivers: new Set() }
    }
    map[r.token].transferred += r.amount
    map[r.token].senders.add(r.from)
    map[r.token].receivers.add(r.to)
  }
  return Object.entries(map).map(([token, data]) => ({
    token,
    totalTransferred: data.transferred,
    uniqueSenders: data.senders.size,
    uniqueReceivers: data.receivers.size,
  }))
}
