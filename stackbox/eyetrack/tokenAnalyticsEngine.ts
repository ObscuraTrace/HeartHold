
import { groupByToken } from "./tokenGroupAggregator"
import { detectSuspiciousActivity } from "./suspiciousActivityDetector"
import type { TransferRecord } from "./tokenGroupAggregator"

export interface AnalyticsOptions {
  transferThreshold: number
  volumeThreshold: number
  suspicionWindowMs: number
}

export interface TokenAnalyticsReport {
  summary: ReturnType<typeof groupByToken>
  suspicious: ReturnType<typeof detectSuspiciousActivity>
}

export function tokenAnalyzer(
  transfers: TransferRecord[],
  activityRecords: Parameters<typeof detectSuspiciousActivity>[0],
  options: AnalyticsOptions
): TokenAnalyticsReport {
  const summary = groupByToken(transfers)
  const suspicious = detectSuspiciousActivity(
    activityRecords,
    options.transferThreshold,
    options.volumeThreshold,
    options.suspicionWindowMs
  )
  return { summary, suspicious }
}
