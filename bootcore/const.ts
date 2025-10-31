export interface MonitorConfig {
  defaultScanIntervalMs: number
  maxTxLookback: number
  minWhaleThreshold: number
  flashActivityWindowMs: number
  riskScoreAlertThreshold: number
  minTokenLiquidity: number
  alertChannels: {
    whaleMoves: string
    suspiciousTokens: string
    flashPumps: string
  }
}


export const DEFAULT_CONFIG: Readonly<MonitorConfig> = Object.freeze({
  defaultScanIntervalMs: 600_000,       // 10 minutes
  maxTxLookback: 200,                   // Max transactions to scan
  minWhaleThreshold: 10_000,            // Minimum tokens to consider whale
  flashActivityWindowMs: 300_000,       
  riskScoreAlertThreshold: 0.85,        
  minTokenLiquidity: 5_000,             
  alertChannels: {
    whaleMoves: "alerts/whales",
    suspiciousTokens: "alerts/tokens",
    flashPumps: "alerts/flash",
  },
})


export function loadConfig(): MonitorConfig {
  const parseEnv = (key: string, fallback: number): number => {
    const val = process.env[key]
    if (val !== undefined) {
      const n = Number(val)
      if (!isNaN(n)) return n
      console.warn(`Invalid number for ${key}: ${val}, using default ${fallback}`)
    }
    return fallback
  }

  return {
    defaultScanIntervalMs: parseEnv("SCAN_INTERVAL_MS", DEFAULT_CONFIG.defaultScanIntervalMs),
    maxTxLookback: parseEnv("MAX_TX_LOOKBACK", DEFAULT_CONFIG.maxTxLookback),
    minWhaleThreshold: parseEnv("MIN_WHALE_THRESHOLD", DEFAULT_CONFIG.minWhaleThreshold),
    flashActivityWindowMs: parseEnv("FLASH_WINDOW_MS", DEFAULT_CONFIG.flashActivityWindowMs),
    riskScoreAlertThreshold: parseEnv("RISK_ALERT_THRESHOLD", DEFAULT_CONFIG.riskScoreAlertThreshold),
    minTokenLiquidity: parseEnv("MIN_TOKEN_LIQUIDITY", DEFAULT_CONFIG.minTokenLiquidity),
    alertChannels: {
      whaleMoves: process.env.ALERT_CHANNEL_WHALES ?? DEFAULT_CONFIG.alertChannels.whaleMoves,
      suspiciousTokens: process.env.ALERT_CHANNEL_TOKENS ?? DEFAULT_CONFIG.alertChannels.suspiciousTokens,
      flashPumps: process.env.ALERT_CHANNEL_FLASH ?? DEFAULT_CONFIG.alertChannels.flashPumps,
    },
  }
}
