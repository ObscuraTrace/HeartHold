
import { z } from "zod"

// Base schema for ObscuraTrace actions
export type ObscuraTraceSchema = z.ZodObject<z.ZodRawShape>

// Standardized response for any action
export interface ObscuraTraceActionResponse<T> {
  notice: string
  data?: T
}

// Core structure defining an ObscuraTrace action
export interface ObscuraTraceActionCore<
  S extends ObscuraTraceSchema,
  R,
  Ctx = unknown
> {
  id: string
  summary: string
  input: S
  execute: (
    args: {
      payload: z.infer<S>
      context: Ctx
    }
  ) => Promise<ObscuraTraceActionResponse<R>>
}

// Union type covering any ObscuraTrace action
export type ObscuraTraceAction = ObscuraTraceActionCore<ObscuraTraceSchema, unknown, unknown>

// Example: Define a riskScan action for ObscuraTrace
export const riskScanAction: ObscuraTraceActionCore<
  z.ZodObject<{
    contractAddress: z.ZodString
    windowMinutes: z.ZodNumber
  }>,
  {
    riskScore: number
    flaggedEvents: Array<{ type: string; timestamp: number }>
  },
  {
    apiEndpoint: string
    apiKey: string
  }
> = {
  id: "riskScan",
  summary: "Perform on-chain risk analysis for a contract over a specified timeframe",
  input: z.object({
    contractAddress: z.string().min(32),
    windowMinutes: z.number().int().positive()
  }),
  execute: async ({ payload, context }) => {
    const { contractAddress, windowMinutes } = payload
    const { apiEndpoint, apiKey } = context

    const resp = await fetch(
      `${apiEndpoint}/obscuratrace/risk-scan?address=${encodeURIComponent(contractAddress)}&window=${windowMinutes}`,
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    )
    if (!resp.ok) {
      throw new Error(`ObscuraTrace risk-scan error: ${resp.status} ${resp.statusText}`)
    }

    const json = await resp.json()
    return {
      notice: `Risk scan complete for ${contractAddress}`,
      data: {
        riskScore: json.score as number,
        flaggedEvents: json.events as Array<{ type: string; timestamp: number }>
      }
    }
  }
}

// Example: Define a whaleAlert action for ObscuraTrace
export const whaleAlertAction: ObscuraTraceActionCore<
  z.ZodObject<{
    minVolume: z.ZodNumber
    sinceMinutes: z.ZodNumber
  }>,
  {
    alerts: Array<{ address: string; moved: number; when: number }>
  },
  {
    apiEndpoint: string
    apiKey: string
  }
> = {
  id: "whaleAlert",
  summary: "Fetch large transfer alerts over the past timeframe",
  input: z.object({
    minVolume: z.number().positive(),
    sinceMinutes: z.number().int().positive()
  }),
  execute: async ({ payload, context }) => {
    const { minVolume, sinceMinutes } = payload
    const { apiEndpoint, apiKey } = context

    const resp = await fetch(
      `${apiEndpoint}/obscuratrace/whale-alerts?min=${minVolume}&since=${sinceMinutes}`,
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    )
    if (!resp.ok) {
      throw new Error(`ObscuraTrace whale-alert error: ${resp.status} ${resp.statusText}`)
    }

    const json = await resp.json()
    return {
      notice: `Whale alerts fetched (>= ${minVolume})`,
      data: {
        alerts: json.alerts as Array<{ address: string; moved: number; when: number }>
      }
    }
  }
}