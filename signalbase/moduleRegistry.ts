import * as EngineCore from "./vaultEngineCore"
import * as VaultActions from "./initializeVaultAction"
import * as VaultOps from "./vaultOperationsEngine"

export const registry = {
  EngineCore,
  VaultActions,
  VaultOps,
} as const

export type ModuleName = keyof typeof registry


export function loadModule(name: ModuleName) {
  const mod = registry[name]
  if (!mod) throw new Error(`Module "${name}" not found`)
  return mod
}
