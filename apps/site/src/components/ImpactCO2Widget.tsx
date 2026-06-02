import type { ImpactCO2Language } from '@nosgestesclimat/core/features/actions/types/action-media'
import Script from 'next/script'

export default function ImpactCO2Widget({
  type,
  language,
  hideButtons,
  options,
}: {
  type: string
  hideButtons?: boolean
  language?: ImpactCO2Language
  options?: Record<string, string>
}) {
  const searchParams = new URLSearchParams({
    theme: 'default',
  })

  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      searchParams.set(key, value)
    })
  }

  if (language) {
    searchParams.set('language', language)
  }

  if (hideButtons) {
    searchParams.set('hideButtons', String(hideButtons))
  }

  /*
    Workaround
    - default impact co2 embed script carries the data attrs and relies on its presence in the DOM to load the iframe in the same place
    - non async scripts (defer or without) cause hydration issues
    - React 19 moves <script async>

    Placing data attrs on a div allows to load the script asynchronously without hydration issues
  */
  return (
    <>
      <div
        data-name="impact-co2"
        data-type={type}
        data-search={`?${searchParams.toString()}`}
      />
      <Script src="https://impactco2.fr/iframe.js" />
    </>
  )
}
