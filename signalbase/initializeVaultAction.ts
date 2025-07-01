import { z } from "zod"
import type { Wallet } from "@coinbase/coinbase-sdk"
import type { ActionResult } from "./vaultActionHandler"
import { VaultOperationsEngine } from "./vaultOperationsEngine"

const InitVaultSchema = z.object({
  vaultId: z.string().uuid(),
  owner: z.string().min(32),
  collateral: z.number().nonnegative(),
})

export type InitVaultInput = z.infer<typeof InitVaultSchema>

export async function initializeVault(
  wallet: Wallet,
  raw: unknown
): Promise<ActionResult> {
  const parsed = InitVaultSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.message }
  }
  const { vaultId, collateral, owner } = parsed.data
  const engine = new VaultOperationsEngine({ network: "mainnet", client: owner })
  engine.setWallet(wallet)

  try {
    await engine.createVault(vaultId, collateral)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}