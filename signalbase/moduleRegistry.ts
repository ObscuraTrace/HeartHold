import * as WalletCore from "./walletCoreEngine"
import * as WalletActions from "./walletActionInit"
import * as WalletOps from "./walletOpsEngine"

export const registry = {
  WalletCore,
  WalletActions,
  WalletOps,
} as const

export type ModuleName = keyof typeof registry

export function loadModule(name: ModuleName) {
  const mod = registry[name]
  if (!mod) throw new Error(`Module "${name}" not found`)
  return mod
}
