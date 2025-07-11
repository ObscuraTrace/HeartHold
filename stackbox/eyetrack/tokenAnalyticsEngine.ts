/**
 * Aggregates and analyzes token transfer data, detecting anomalies.
 */
import { groupByToken } from "./tokenGroupAggregator"
import { detectSuspiciousActivity } from "./suspiciousActivityDetector"
import type { TransferRecord } from "./tokenGroupAggregator"
import type { ActivityRecord } from "./suspiciousActivityDetector"

/**
 * Configuration options for token analysis
 */
export interface AnalyticsOptions {
  /** Minimum number of transfers to include in summary (default: 10) */
  transferThreshold: number
  /** Minimum total volume to flag in summary (default: 1000) */
  volumeThreshold: number
  /** Time window (ms) to detect suspicious bursts (default: 60000) */
  suspicionWindowMs: number
}

/**
 * Report containing aggregated summary and suspicious activity details
 */
export interface TokenAnalyticsReport {
  /** Token-centric aggregation of transfers */
  summary: ReturnType<typeof groupByToken>
  /** Detected suspicious behavior patterns */
  suspicious: ReturnType<typeof detectSuspiciousActivity>
}

/**
 * Main entrypoint for token analytics
 * @param transfers        Array of transfer records to summarize
 * @param activityRecords  Array of timestamped activity events
 * @param options          Analysis thresholds and window settings
 * @returns                Combined summary and suspicious activity report
 * @throws                 Error on invalid input or internal failures
 */
export function tokenAnalyzer(
  transfers: TransferRecord[],
  activityRecords: ActivityRecord[],
  options: AnalyticsOptions
): TokenAnalyticsReport {
  // Validate inputs
  if (!Array.isArray(transfers)) {
    throw new TypeError(`transfers must be an array, got ${typeof transfers}`)
  }
  if (!Array.isArray(activityRecords)) {
    throw new TypeError(`activityRecords must be an array, got ${typeof activityRecords}`)
  }
  const { transferThreshold, volumeThreshold, suspicionWindowMs } = options
  if (transferThreshold <= 0 || volumeThreshold <= 0 || suspicionWindowMs <= 0) {
    throw new RangeError(`All thresholds and windows must be positive, got: ${JSON.stringify(options)}`)
  }

  // Perform grouping and detection
  let summary, suspicious
  try {
    summary = groupByToken(transfers, transferThreshold, volumeThreshold)
  } catch (err: any) {
    throw new Error(`groupByToken failed: ${err.message}`)
  }
  try {
    suspicious = detectSuspiciousActivity(
      activityRecords,
      transferThreshold,
      volumeThreshold,
      suspicionWindowMs
    )
  } catch (err: any) {
    throw new Error(`detectSuspiciousActivity failed: ${err.message}`)
  }

  return { summary, suspicious }
}
