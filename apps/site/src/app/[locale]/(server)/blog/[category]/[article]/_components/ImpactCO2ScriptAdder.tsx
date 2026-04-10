'use client'

import Script from 'next/script'
import { useEffect } from 'react'

function ImpactCO2ScriptAdder() {
  useEffect(() => {
    // @ts-expect-error: Loaded by script
    if (window.impactCO2Detection) {
      // @ts-expect-error: Loaded by script
      window.impactCO2Detection()
    }
  }, [])

  return (
    <Script
      src="https://impactco2.fr/scripts/detection-async.js"
      onLoad={() => {
        // @ts-expect-error: Loaded by script
        window.impactCO2Detection()
      }}
    />
  )
}

export default ImpactCO2ScriptAdder
