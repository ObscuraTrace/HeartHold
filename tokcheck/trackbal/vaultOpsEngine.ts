
import { VaultCoreEngine, VaultStatus, VaultConfig } from "./vaultCoreEngine"
import type { ActionResult } from "./vaultActionHandler"

export interface LiquidationParams {
  vaultId: string
  minHealthRatio: number
}

export interface RebalanceParams {
  vaultId: string
  targetHealthRatio: number
}

export class VaultOpsEngine {
  private core: VaultCoreEngine

  constructor(config: VaultConfig) {
    this.core = new VaultCoreEngine(config)
  }

  /**
   * Check vault health and trigger liquidation if below threshold.
   */
  async checkAndLiquidate(
    params: LiquidationParams
  ): Promise<ActionResult<string>> {
    try {
      const status: VaultStatus = await this.core.getStatus(params.vaultId)
      if (status.healthRatio < params.minHealthRatio) {
        // call emergency withdrawal or liquidation flow
        const link = await this.core.withdraw(
          params.vaultId,
          status.collateral
        )
        return {
          success: true,
          data: `Liquidation executed, tx: ${link}`
        }
      }
      return {
        success: true,
        data: "Health ratio above threshold—no liquidation needed"
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  /**
   * Rebalance collateral to achieve a target health ratio.
   */
  async rebalanceCollateral(
    params: RebalanceParams
  ): Promise<ActionResult<string>> {
    try {
      const status = await this.core.getStatus(params.vaultId)
      const requiredCollateral =
        (status.debt * params.targetHealthRatio) / 100
      const delta = requiredCollateral - status.collateral

      if (Math.abs(delta) < 1e-6) {
        return { success: true, data: "Vault already balanced" }
      }

      let link: string
      if (delta > 0) {
        link = await this.core.deposit(params.vaultId, delta)
      } else {
        link = await this.core.withdraw(params.vaultId, -delta)
      }

      return {
        success: true,
        data: `Rebalance executed (ΔCollateral: ${delta.toFixed(
          2
        )}), tx: ${link}`
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  /**
   * Automate a leverage move: borrow collateral, then deposit back.
   */
  async leverage(
    vaultId: string,
    borrowAmount: number
  ): Promise<ActionResult<string>> {
    try {
      const borrowLink = await this.core.withdraw(vaultId, borrowAmount)
      const depositLink = await this.core.deposit(vaultId, borrowAmount)
      return {
        success: true,
        data: `Leverage cycle complete. Withdraw TX: ${borrowLink}, Deposit TX: ${depositLink}`
      }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }
}
