import * as WalletCore from "./walletCoreEngine"
import * as WalletActions from "./walletActionInit"
import * as WalletOps from "./walletOpsEngine"

// additional helper imports for extended functionality
import * as WalletUtils from "./walletUtils"
import * as WalletSignals from "./walletSignalEngine"

export const registry = {
  WalletCore,
  WalletActions,
  WalletOps,
  WalletUtils,
  WalletSignals,
} as const

export type ModuleName = keyof typeof registry

export function loadModule(name: ModuleName) {
  const mod = registry[name]
  if (!mod) {
    throw new Error(`Module "${name}" not found in registry`)
  }
  return mod
}

export function listModules(): ModuleName[] {
  return Object.keys(registry) as ModuleName[]
}

export function hasModule(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(registry, name)
}

export function safeLoadModule(name: string) {
  if (!hasModule(name)) {
    return null
  }
  return registry[name as ModuleName]
}
