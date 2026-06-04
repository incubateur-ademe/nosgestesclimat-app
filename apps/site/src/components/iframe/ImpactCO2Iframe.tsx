'use client'

import type { ImpactCO2Language } from '@nosgestesclimat/core/features/actions/types/action-media'
import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

interface ImpactCO2IframeProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * ImpactCO2 type e.g.
   * @example "chauffage"
   */
  type: string
  /** Iframe title attribute */
  title: string
  locale?: ImpactCO2Language
  hideButtons?: boolean
  /** Additional ImpactCO2 iframe search params */
  options?: Record<string, string>
}

/*
  Workaround
  - default impact co2 embed script carries the data attrs and relies on its presence in the DOM to load the iframe in the same place
  - non async scripts (defer or without) cause hydration issues
  - React 19 moves <script async>

  Placing data attrs on a div allows to load the script asynchronously without hydration issues
*/
export default function ImpactCO2Iframe({
  title,
  locale,
  type,
  hideButtons = true,
  options,
  className,
  ...rest
}: ImpactCO2IframeProps) {
  const [isLoading, setIsLoading] = useState(true)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const searchParams = new URLSearchParams({
    theme: 'default',
    hideButtons: String(hideButtons),
  })

  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      searchParams.set(key, value)
    })
  }

  if (locale) {
    searchParams.set('language', locale)
  }

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
      className={twMerge('relative', className)}
      {...rest}>
      {/* Skeleton loader */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex h-full flex-col gap-4 rounded-xl bg-white p-6 opacity-80">
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
        title={title}
        data-name="impact-co2"
        data-type={type}
        data-search={`?${searchParams.toString()}`}
        className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  )
}
