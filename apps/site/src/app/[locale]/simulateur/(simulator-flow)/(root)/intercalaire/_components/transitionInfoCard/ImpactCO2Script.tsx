'use client'

import { useEffect } from 'react'

interface Props {
  locale: string
  type?: string
  additionalSearchParams?: string
}

export default function ImpactCO2Script({
  locale,
  type = 'chauffage',
  additionalSearchParams,
}: Props) {
  // Handles injecting and removing the script on page change
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://impactco2.fr/iframe.js'
    document.body.appendChild(script)

    return () => {
      // Without this after having rendered a first iframe
      // the script doesn't work anymore
      script.remove()
    }
  }, [type])

  return (
    <div
      id="impact-co2"
      data-type={type}
      data-search={`?m2=63&language=${locale}&theme=default${additionalSearchParams ? `&${additionalSearchParams}` : ''}`}
    />
  )
}
