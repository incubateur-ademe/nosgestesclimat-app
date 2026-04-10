'use client'

import { useEffect } from 'react'

export default function Scroller() {
  useEffect(() => {
    const handleAnchor = () => {
      if (window.location.hash) {
        const anchor = decodeURI(window.location.hash.substring(1)) // Extrait l'ancre de l'URL sans le '#'
        const questionElement = document.getElementById(anchor)

        if (questionElement) {
          // Faites défiler jusqu'à la question si nécessaire
          questionElement.scrollIntoView({ behavior: 'smooth' })
          questionElement.setAttribute('open', 'true')
        }
      }
    }

    handleAnchor()

    document.addEventListener('DOMContentLoaded', handleAnchor)

    return () => {
      document.removeEventListener('DOMContentLoaded', handleAnchor)
    }
  }, [])

  return null
}
