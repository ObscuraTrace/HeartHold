export interface TokenEvent {
  timestamp: number
  type: "mint" | "burn" | "transfer"
  amount: number
}

export interface LifecycleMetrics {
  totalMinted: number
  totalBurned: number
  totalTransferred: number
  mintBurnRatio: number
  netSupply: number
}

export class TokenLifecycleTracker {
  private events: TokenEvent[] = []

  add(event: TokenEvent): void {
    this.events.push(event)
  }

  computeMetrics(): LifecycleMetrics {
    let minted = 0, burned = 0, transferred = 0
    for (const e of this.events) {
      if (e.type === "mint") minted += e.amount
      if (e.type === "burn") burned += e.amount
      if (e.type === "transfer") transferred += e.amount
    }
    const ratio = burned > 0 ? minted / burned : Infinity
    const netSupply = minted - burned
    return {
      totalMinted: minted,
      totalBurned: burned,
      totalTransferred: transferred,
      mintBurnRatio: Math.round(ratio * 100) / 100,
      netSupply,
    }
  }

  getTimeline(sorted = true): TokenEvent[] {
    const list = [...this.events]
    return sorted ? list.sort((a, b) => a.timestamp - b.timestamp) : list
  }

  reset(): void {
    this.events = []
  }
}
