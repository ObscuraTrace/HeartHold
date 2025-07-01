import type { AnalyticsOptions, TokenAnalyticsReport } from "./tokenAnalyticsEngine"
import { tokenAnalyzer } from "./tokenAnalyticsEngine"
import type { TransferRecord } from "./tokenGroupAggregator"
import type { ActivityRecord } from "./suspiciousActivityDetector"

export async function useTokenAnalytics(
  transferData: TransferRecord[],
  activityData: ActivityRecord[],
  options: AnalyticsOptions
): Promise<TokenAnalyticsReport> {
  await Promise.resolve()
  return tokenAnalyzer(transferData, activityData, options)
}
