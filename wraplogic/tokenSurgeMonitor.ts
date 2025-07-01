
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

  constructor(private threshold: number) {}

  record(snapshot: VolumeSnapshot): SurgeEvent | null {
    this.history.push(snapshot)
    const len = this.history.length
    if (len < 2) return null

    const prev = this.history[len - 2]
    const curr =
