import React from "react"
import { FeatureMap } from "@/components/FeatureMap"

interface RiskMapProps {
  width: number
  height: number
}

export const RiskMap: React.FC<RiskMapProps> = ({ width, height }) => {
  // Placeholder data fetch logic
  const data = [] // fetch risk coordinates from API

  return (
    <div style={{ width, height, border: '1px solid #444', borderRadius: '8px' }}>
      <FeatureMap data={data} width={width} height={height} intensity="high" />
    </div>
  )
}

export default RiskMap