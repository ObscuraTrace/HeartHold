export const PROJECT_NAME = "OrbixWallet"

export interface AppConfig {
  projectName: string
  solanaRpcUrl: string
  streamflowApi: string
  rugcheckApi: string
  dexscreenerApi: string
  birdyApi: string
  heartbeatUrl: string
}

export const config: AppConfig = {
  projectName: PROJECT_NAME,

  // Solana RPC
  solanaRpcUrl:
    process.env.SOLANA_RPC_URL ||
    "https://api.mainnet-beta.solana.com",

  // Real-world API endpoints
  streamflowApi:
    process.env.STREAMFLOW_API ||
    "https://api.streamflow.finance/v1/events",

  rugcheckApi:
    process.env.RUGCHECK_API ||
    "https://api.rugcheck.io/v1/check",

  dexscreenerApi:
    process.env.DEXSCREENER_API ||
    "https://api.dexscreener.com/latest/dex/tokens",

  birdyApi:
    process.env.BIRDY_API ||
    "https://api.birdy.ai/v1",

  heartbeatUrl:
    process.env.HEARTBEAT_URL ||
    "https://status.orbixvault.app/heartbeat"
}
