import React, { useEffect, useState } from "react"
import type { WhaleMovement } from "@/services/traceWhaleMovements"
import { analyzeWhaleMovements } from "@/services/traceWhaleMovements"

export const WhaleAlertList: React.FC = () => {
  const [alerts, setAlerts] = useState<WhaleMovement[]>([])

  useEffect(() => {
    async function load() {
      const recs = await fetch('/api/whale-movements').then(res => res.json())
      const data: WhaleMovement[] = recs.data
      setAlerts(data.filter(m => m.totalMoved > 10000))
    }
    load()
  }, [])

  return (
    <div style={{ maxWidth: '360px' }}>
      <h3>Whale Alerts</h3>
      <ul>
        {alerts.map(a => (
          <li key={a.address} style={{ marginBottom: '8px' }}>
            <strong>{a.address}</strong>: moved {a.totalMoved.toLocaleString()} tokens
          </li>
        ))}
      </ul>
    </div>
  )
}

export default WhaleAlertList
