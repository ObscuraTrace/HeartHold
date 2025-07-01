
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

export class TokenFlowAggregator {
  private records: TransferRecord[] = []

  constructor(records?: TransferRecord[]) {
    if (records) this.records = [...records]
  }

  add(record: TransferRecord): void {
    this.records.push(record)
  }

  aggregate(): FlowSummary {
    const inflow: Record<string, number> = {}
    const outflow: Record<string, number> = {}

    for (const r of this.records) {
      outflow[r.from] = (outflow[r.from] || 0) + r.amount
      inflow[r.to] = (inflow[r.to] || 0) + r.amount
    }

    const totalIn = Object.values(inflow).reduce((a, b) => a + b, 0)
    const totalOut = Object.values(outflow).reduce((a, b) => a + b, 0)
    const netFlow = totalIn - totalOut

    const sortAndPick = (obj: Record<string, number>) =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([address, amount]) => ({ address, amount }))

    return {
      totalIn,
      totalOut,
      netFlow,
      topSenders: sortAndPick(outflow),
      topRecipients: sortAndPick(inflow),
    }
  }

  clear(): void {
    this.records = []
  }
}
