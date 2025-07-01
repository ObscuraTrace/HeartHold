
export interface Order {
  price: number
  size: number
}

export interface OrderBook {
  bids: Order[]
  asks: Order[]
}

export interface DepthMetrics {
  bidDepth: number
  askDepth: number
  spread: number
  midPrice: number
  imbalance: number // (bidDepth - askDepth)/(bidDepth+askDepth)
}

export function computeDepthMetrics(
  book: OrderBook,
  levels: number = 10
): DepthMetrics {
  const bids = book.bids.slice(0, levels)
  const asks = book.asks.slice(0, levels)
  const bidDepth = bids.reduce((acc, o) => acc + o.size, 0)
  const askDepth = asks.reduce((acc, o) => acc + o.size, 0)
  const bestBid = bids[0]?.price ?? 0
  const bestAsk = asks[0]?.price ?? 0
  const spread = bestAsk - bestBid
  const midPrice = (bestAsk + bestBid) / 2
  const imbalance =
    bidDepth + askDepth > 0 ? (bidDepth - askDepth) / (bidDepth + askDepth) : 0
  return { bidDepth, askDepth, spread, midPrice, imbalance }
}

/**
 * Flattens the book into a net size per price level.
 */
export function flattenOrderBook(
  book: OrderBook
): Array<{ price: number; netSize: number }> {
  const map = new Map<number, number>()
  for (const o of book.bids) {
    map.set(o.price, (map.get(o.price) || 0) + o.size)
  }
  for (const o of book.asks) {
    map.set(o.price, (map.get(o.price) || 0) - o.size)
  }
  return Array.from(map.entries()).map(([price, netSize]) => ({ price, netSize }))
}