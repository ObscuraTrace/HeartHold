
import {
  MarketTrendPredictor,
  TrendSignal,
} from "./marketTrendPredictor"

export interface OracleConfig {
  prices: number[]
  timestamps: number[]
  lookbackWindow?: number
  topCount?: number
}

export interface OracleRecommendation {
  signal: TrendSignal
  advice: "buy" | "sell" | "hold"
}

export class MarketTrendOracle {
  private predictor: MarketTrendPredictor
  private window: number
  private topCount: number

  constructor(config: OracleConfig) {
    this.predictor = new MarketTrendPredictor(
      config.prices,
      config.timestamps
    )
    this.window = config.lookbackWindow ?? 5
    this.topCount = config.topCount ?? 3
  }

  recommend(): OracleRecommendation[] {
    // generate signals
    const signals = this.predictor.predict(this.window)
    // pick top signals by confidence
    const top = this.predictor.topSignals(signals, this.topCount)

    // map each to an advice
    return top.map(sig => {
      let advice: OracleRecommendation["advice"] = "hold"
      if (sig.signal === "Bullish" && sig.confidence > 60) advice = "buy"
      if (sig.signal === "Bearish" && sig.confidence > 60) advice = "sell"
      return { signal: sig, advice }
    })
  }
}