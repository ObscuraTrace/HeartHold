import { Connection, PublicKey, Finality, ParsedTransactionWithMeta, TokenBalance } from "@solana/web3.js"

export interface TimeBucket {
  hour: number            // 0..23 (UTC)
  txCount: number         // number of txs that touched the mint in this hour
  avgVolume: number       // average token volume per tx (ui units, not lamports)
}

export interface HeatmapReport {
  mint: string
  peakHours: number[]     // hours with max txCount
  buckets: TimeBucket[]
}

export interface HeatmapOptions {
  /** Commitment level for RPC calls (default: "confirmed") */
  commitment?: Finality
  /**
   * Max signatures to pull per largest token account (default: 200).
   * Note: time filtering is best-effort; higher values improve recall but cost more RPC.
   */
  maxSignaturesPerAccount?: number
  /** Max parsed transactions to process overall after deduplication (default: 1000) */
  maxTransactions?: number
  /** Batch size for getParsedTransactions (default: 20) */
  batchSize?: number
  /** Optional AbortSignal to cancel long scans */
  signal?: AbortSignal
}

/**
 * Generate a 24-bin hourly heatmap of token activity for a given SPL mint.
 * Activity is derived from parsed transactions that modify balances of the mint's largest token accounts.
 * avgVolume is computed from pre/post token balances (sum of absolute account deltas / 2 per tx).
 *
 * NOTE:
 * - This does not query the mint account itself (which rarely has many txs).
 * - Instead, it inspects the largest token accounts for this mint and aggregates their txs.
 */
export async function generateTokenActivityHeatmap(
  connection: Connection,
  mintAddress: string,
  hoursBack: number = 24,
  opts: HeatmapOptions = {}
): Promise<HeatmapReport> {
  const {
    commitment = "confirmed",
    maxSignaturesPerAccount = 200,
    maxTransactions = 1000,
    batchSize = 20,
    signal,
  } = opts

  const mint = new PublicKey(mintAddress)
  const mintStr = mint.toBase58()
  const nowSec = Math.floor(Date.now() / 1000)
  const sinceSec = nowSec - Math.max(1, hoursBack) * 3600

  // Helper to honor aborts between RPC calls
  const assertNotAborted = () => {
    if (signal?.aborted) throw new Error("Aborted")
  }

  assertNotAborted()

  // 1) Find largest token accounts for this mint (heuristic to capture active txs)
  const largest = await connection.getTokenLargestAccounts(mint, commitment)
  assertNotAborted()
  const tokenAccounts = largest.value.map((x) => x.address).slice(0, 20) // cap to 20 for sanity

  // 2) Collect unique signatures touching these token accounts within the window
  const sigMap = new Map<string, number>() // signature -> blockTime
  for (const acc of tokenAccounts) {
    assertNotAborted()
    const infos = await connection.getSignaturesForAddress(acc, { limit: maxSignaturesPerAccount }, commitment)
    for (const info of infos) {
      const bt = info.blockTime ?? 0
      if (bt >= sinceSec) {
        // Keep the newest blockTime if duplicate across accounts
        const prev = sigMap.get(info.signature)
        if (!prev || bt > prev) sigMap.set(info.signature, bt)
      }
    }
  }

  // 3) Deduplicate, sort by blockTime desc, and cap to maxTransactions
  const entries = Array.from(sigMap.entries()).sort((a, b) => (b[1] - a[1]))
  const limited = entries.slice(0, maxTransactions)
  const signatures = limited.map(([sig]) => sig)

  // 4) Fetch parsed transactions in batches and aggregate per-hour stats
  const txCountByHour = Array<number>(24).fill(0)
  const volumeSumByHour = Array<number>(24).fill(0)

  for (let i = 0; i < signatures.length; i += batchSize) {
    assertNotAborted()
    const chunk = signatures.slice(i, i + batchSize)
    const parsed = await connection.getParsedTransactions(chunk, { maxSupportedTransactionVersion: 0, commitment })
    // parsed: (ParsedTransactionWithMeta | null)[]
    for (const tx of parsed) {
      if (!tx || tx.blockTime == null) continue
      if (tx.blockTime < sinceSec) continue
      const hour = new Date(tx.blockTime * 1000).getUTCHours()
      const vol = computeMintVolumeFromBalances(tx, mintStr)
      txCountByHour[hour] += 1
      volumeSumByHour[hour] += vol
    }
  }

  // 5) Build 24 buckets (0..23 UTC)
  const buckets: TimeBucket[] = []
  for (let h = 0; h < 24; h++) {
    const c = txCountByHour[h]
    const avg = c > 0 ? volumeSumByHour[h] / c : 0
    buckets.push({ hour: h, txCount: c, avgVolume: round(avg, 6) })
  }

  // 6) Determine peak hours (could be multiple)
  const peakCount = Math.max(...buckets.map((b) => b.txCount), 0)
  const peakHours = peakCount > 0 ? buckets.filter((b) => b.txCount === peakCount).map((b) => b.hour) : []

  return {
    mint: mintStr,
    peakHours,
    buckets,
  }
}

/* --------------------------------- Helpers --------------------------------- */

/**
 * Estimate token volume for a given mint using pre/post token balances in a parsed tx.
 * We sum absolute balance deltas for the mint across all accounts and divide by 2
 * to avoid double-counting (each transfer shows a decrease and an increase of equal size).
 */
function computeMintVolumeFromBalances(tx: ParsedTransactionWithMeta, mint: string): number {
  const pre = (tx.meta?.preTokenBalances ?? []).filter((b) => b.mint === mint)
  const post = (tx.meta?.postTokenBalances ?? []).filter((b) => b.mint === mint)

  if (pre.length === 0 && post.length === 0) return 0

  // Map accountIndex -> amount (ui units)
  const preMap = new Map<number, number>()
  const postMap = new Map<number, number>()

  for (const pb of pre) preMap.set(pb.accountIndex, uiAmount(pb))
  for (const qb of post) postMap.set(qb.accountIndex, uiAmount(qb))

  let sumAbs = 0
  const indices = new Set<number>([...preMap.keys(), ...postMap.keys()])
  for (const idx of indices) {
    const a = preMap.get(idx) ?? 0
    const b = postMap.get(idx) ?? 0
    sumAbs += Math.abs(b - a)
  }

  // Divide by 2 to account for symmetric +/- across accounts in a transfer
  return sumAbs / 2
}

function uiAmount(b: TokenBalance): number {
  // Prefer uiAmount; if null, derive from amount/decimals
  const u = b.uiTokenAmount
  if (typeof u.uiAmount === "number") return u.uiAmount
  const dec = u.decimals ?? 0
  const raw = Number(u.amount ?? 0)
  return dec > 0 ? raw / Math.pow(10, dec) : raw
}

function round(x: number, digits: number): number {
  const p = Math.pow(10, digits)
  return Math.round(x * p) / p
}
