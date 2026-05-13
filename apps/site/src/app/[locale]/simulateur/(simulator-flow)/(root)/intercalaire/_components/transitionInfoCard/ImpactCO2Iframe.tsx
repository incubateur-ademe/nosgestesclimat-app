'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  title: string
  locale: string
  type?: string
  additionalSearchParams?: string
}

export default function ImpactCO2Iframe({
  title,
  locale,
  type = 'chauffage',
  additionalSearchParams,
}: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const wrapperRef = useRef<HTMLDivElement>(null)

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

  // Observe the wrapper to detect when the iframe is injected as a sibling of #impact-co2
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const observer = new MutationObserver(() => {
      const iframe = wrapper.querySelector('iframe')

      if (iframe) {
        iframe.addEventListener('load', () => {
          setIsLoading(false)
        })
        // If the iframe is already cached and complete, hide skeleton immediately
        if (iframe.contentDocument?.readyState === 'complete') {
          setIsLoading(false)
        }
        observer.disconnect()
      }
    })

    observer.observe(wrapper, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [type])

  return (
    <div
      key={type}
      ref={wrapperRef}
      className="relative"
      style={{ minHeight: '1320px' }}>
      {/* Skeleton loader */}
      {isLoading && (
        <div className="absolute inset-0 z-10 mt-8 flex h-full flex-col gap-4 rounded-xl bg-white p-6 opacity-80">
          <div className="bg-primary-200 h-4 w-3/4 animate-pulse rounded-md" />
          <div className="bg-primary-200 h-4 w-1/2 animate-pulse rounded-md" />
          <div className="mt-2 flex flex-1 animate-pulse flex-col items-start gap-2">
            <div className="bg-primary-200 h-20 w-3/4 animate-pulse rounded-md" />
            <div className="bg-primary-200 h-20 w-1/2 animate-pulse rounded-md" />
            <div className="bg-primary-200 h-20 w-2/3 animate-pulse rounded-md" />
            <div className="bg-primary-200 h-20 w-4/5 animate-pulse rounded-md" />
            <div className="bg-primary-200 h-20 w-1/3 animate-pulse rounded-md" />
          </div>
        </div>
      )}

      {/* Iframe container */}
      <div
        id="impact-co2"
        title={title}
        data-type={type}
        data-search={`?language=${locale}&hideButtons=true&theme=default${additionalSearchParams ? `&${additionalSearchParams}` : ''}`}
        className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  )
}
