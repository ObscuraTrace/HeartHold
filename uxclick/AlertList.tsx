import React, { useEffect, useState } from "react"
import type { WhaleMovement } from "@/services/walletWhaleTrace"
import { analyzeWhaleMovements } from "@/services/walletWhaleTrace"

export const WhaleAlertList: React.FC = () => {
  const [alerts, setAlerts] = useState<WhaleMovement[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/whale-movements")
        if (!res.ok) throw new Error(`API request failed: ${res.status}`)
        const recs = await res.json()
        const data: WhaleMovement[] = recs.data || []
        const analyzed = analyzeWhaleMovements(data)
        setAlerts(analyzed.filter(m => m.totalMoved > 10000))
      } catch (err: any) {
        setError(err.message || "Failed to load whale movements")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div style={{ maxWidth: "380px", padding: "12px" }}>
      <h3>Whale Alerts</h3>
      {loading && <p>Loading whale movements...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && alerts.length === 0 && (
        <p>No significant whale activity detected</p>
      )}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {alerts.map(a => (
          <li
            key={a.address}
            style={{
              marginBottom: "10px",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "#fafafa"
            }}
          >
            <strong>{a.address}</strong>
            <br />
            Moved {a.totalMoved.toLocaleString()} tokens
          </li>
        ))}
      </ul>
    </div>
  )
}

export default WhaleAlertList
