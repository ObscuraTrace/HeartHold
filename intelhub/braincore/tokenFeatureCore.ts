

export interface CoreConfig {
  priceData: { timestamp: number; price: number }[]
  volumeData: { timestamp: number; volume: number }[]
  volatilityWindow: number
}

export interface CoreReport {
  features: FeatureVector[]
  overallVolatility: number
  priceStdDev: number
}

export class TokenFeatureCore {
  private extractor: TokenFeatureExtractor
  private priceData: CoreConfig["priceData"]
  private volumeData: CoreConfig["volumeData"]
  private volatilityWindow: number

  constructor(config: CoreConfig) {
    this.priceData = config.priceData
    this.volumeData = config.volumeData
    this.volatilityWindow = config.volatilityWindow
    this.extractor = new TokenFeatureExtractor(this.priceData, this.volumeData)
  }

  run(): CoreReport {
    // extract per-timestamp features
    const features = this.extractor.extract()

    // compute an overall volatility metric
    const prices = this.priceData.map(p => p.price)
    const overallVol = analyzeVolatility(
      this.priceData.map(p => ({ timestamp: p.timestamp, price: p.price })),
      this.volatilityWindow,
      this.volatilityWindow
    ).historicalVolatility

    // compute standard deviation of prices
    const stdDev = computeStandardDeviation(prices)

    return {
      features,
      overallVolatility: Math.round(overallVol * 1e6) / 1e6,
      priceStdDev: Math.round(stdDev * 1e6) / 1e6,
    }
  }
}
