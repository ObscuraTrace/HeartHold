import React, { useMemo } from "react"
import { TokenInsightCard } from "./TokenInsightCard"
import { RiskSignalBadge } from "./RiskSignalBadge"
import { WalletActivityGraph } from "./WalletActivityGraph"
import { WhaleTransferList } from "./WhaleTransferList"
import { AlertBanner } from "./AlertBanner"

type RiskLevel = "Low" | "Moderate" | "High"

const formatUSD = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 })

/**
 * AnalyzerDashboard — structured, accessible, and layout-friendly version
 * - Strongly typed sample data
 * - Derived memoized values
 * - Improved layout semantics (main/section/aria)
 */
const AnalyzerDashboard: React.FC = () => {
  // Sample, deterministic data (replace with live sources as needed)
  const tokenData = useMemo(
    () => ({
      name: "SOLANA",
      riskLevel: "High" as RiskLevel,
      volume: 1_543_200,
    }),
    []
  )

  const whaleTransfers = useMemo(
    () => [
      { amount: 120_000, token: "SOL", address: "FgkE9rW...7Pq2" },
      { amount: 88_000, token: "SOL", address: "9kq3reP...Mwb1" },
    ],
    []
  )

  const walletActivity = useMemo(
    () => [
      { time: "10:00", value: 400 },
      { time: "11:00", value: 850 },
      { time: "12:00", value: 300 },
    ],
    []
  )

  const riskDeltaPct = 37.4
  const alertMsg = `Spike detected on SOL — ${riskDeltaPct}% risk increase in last hour`

  return (
    <main
      className="analyzer-dashboard container mx-auto p-4"
      aria-label="Analyzer dashboard"
    >
      {/* Top alert */}
      <div className="mb-4" role="region" aria-label="Alerts">
        <AlertBanner message={alertMsg} />
      </div>

      {/* Overview row */}
      <section
        className="dashboard-section grid gap-4 md:grid-cols-3 mb-6"
        aria-label="Token overview"
      >
        <div className="md:col-span-2">
          <TokenInsightCard
            tokenName={tokenData.name}
            riskLevel={tokenData.riskLevel}
            volume={tokenData.volume}
          />
        </div>

        <div className="flex items-stretch justify-start">
          <div className="w-full">
            <RiskSignalBadge level={tokenData.riskLevel} />
            <div className="mt-3 text-sm text-gray-600">
              24h Volume: <strong>${formatUSD(tokenData.volume)}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Activity + whales */}
      <section
        className="dashboard-section grid gap-4 md:grid-cols-3"
        aria-label="Activity and whale transfers"
      >
        <div className="md:col-span-2">
          <WalletActivityGraph data={walletActivity} />
        </div>
        <div className="md:col-span-1">
          <WhaleTransferList transfers={whaleTransfers} />
        </div>
      </section>
    </main>
  )
}

export default AnalyzerDashboard
