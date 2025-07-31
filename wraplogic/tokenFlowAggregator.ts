export interface TransferRecord {
  timestamp: number
  from: string
  to: string
  amount: number
}

export interface FlowSummary {
  totalIn: number
  totalOut: number
  netFlow: number
  topSenders: { address: string; amount: number }[]
  topRecipients: { address: string; amount: number }[]
}

export interface AggregateOptions {
  /** Include records with timestamp >= since (ms) */
  since?: number
  /** Include records with timestamp <= until (ms) */
  until?: number
  /** How many top addresses to return */
  topN?: number
}

export class TokenFlowAggregator {
  private records: TransferRecord[] = []

  constructor(initialRecords?: TransferRecord[]) {
    if (initialRecords) {
      this.records = [...initialRecords]
    }
  }

  /** Add a single transfer record */
  add(record: TransferRecord): void {
    if (record.amount <= 0) {
      throw new Error(`Invalid transfer amount: ${record.amount}`)
    }
    this.records.push(record)
  }

  /**
   * Aggregate flow with optional time filtering and top-N configuration
   */
  aggregate(options: AggregateOptions = {}): FlowSummary {
    const { since, until, topN = 5 } = options

    const inflow: Record<string, number> = {}
    const outflow: Record<string, number> = {}

    for (const r of this.records) {
      if ((since !== undefined && r.timestamp < since) ||
          (until !== undefined && r.timestamp > until)) {
        continue
      }
      outflow[r.from] = (outflow[r.from] || 0) + r.amount
      inflow[r.to]    = (inflow[r.to]    || 0) + r.amount
    }

    const sum = (obj: Record<string, number>) =>
      Object.values(obj).reduce((a, b) => a + b, 0)

    const totalIn  = sum(inflow)
    const totalOut = sum(outflow)
    const netFlow  = totalIn - totalOut

    const sortAndPick = (obj: Record<string, number>) =>
      Object.entries(obj)
        .sort(([, a], [, b]) => b - a)
        .slice(0, topN)
        .map(([address, amount]) => ({ address, amount }))

    return {
      totalIn,
      totalOut,
      netFlow,
      topSenders:    sortAndPick(outflow),
      topRecipients: sortAndPick(inflow),
    }
  }

  /** Clear all stored records */
  clear(): void {
    this.records = []
  }
}
