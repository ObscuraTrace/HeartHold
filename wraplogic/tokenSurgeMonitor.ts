export interface VolumeSnapshot {
  timestamp: number
  volume: number
}

export interface SurgeEvent {
  time: number
  previous: number
  current: number
  ratio: number
}

export class TokenSurgeMonitor {
  private history: VolumeSnapshot[] = []
  private readonly threshold: number

  constructor(threshold: number) {
    if (threshold <= 1) {
      throw new Error("Threshold must be greater than 1 (e.g., 1.5 means +50%)")
    }
    this.threshold = threshold
  }

  /**
   * Records a new snapshot and checks for surge events
   */
  record(snapshot: VolumeSnapshot): SurgeEvent | null {
    this.history.push(snapshot)

    const len = this.history.length
    if (len < 2) return null

    const prev = this.history[len - 2]
    const curr = this.history[len - 1]

    if (prev.volume <= 0) return null

    const ratio = curr.volume / prev.volume

    if (ratio >= this.threshold) {
      return {
        time: curr.timestamp,
        previous: prev.volume,
        current: curr.volume,
        ratio
      }
    }

    return null
  }

  /**
   * Returns the most recent N snapshots
   */
  getRecentSnapshots(limit: number = 10): VolumeSnapshot[] {
    return this.history.slice(-limit)
  }

  /**
   * Clears stored history
   */
  reset(): void {
    this.history = []
  }
}
