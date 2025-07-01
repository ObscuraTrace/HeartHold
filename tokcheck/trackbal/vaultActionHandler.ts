
import type { VaultCoreEngine, VaultStatus } from './vaultCoreEngine'

export type ActionResult<T> = { success: boolean; data?: T; error?: string }

export class VaultActionHandler {
  constructor(private engine: VaultCoreEngine) {}

  async initVault(vaultId: string, collateral: number): Promise<ActionResult<void>> {
    try {
      await this.engine.initialize(vaultId, collateral)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  async depositCollateral(vaultId: string, amount: number): Promise<ActionResult<string>> {
    try {
      const link = await this.engine.deposit(vaultId, amount)
      return { success: true, data: link }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  async withdrawCollateral(vaultId: string, amount: number): Promise<ActionResult<string>> {
    try {
      const link = await this.engine.withdraw(vaultId, amount)
      return { success: true, data: link }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  async fetchStatus(vaultId: string): Promise<ActionResult<VaultStatus>> {
    try {
      const status = await this.engine.getStatus(vaultId)
      return { success: true, data: status }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }
}
