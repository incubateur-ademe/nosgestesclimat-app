'use client'

import { useEffect, useState } from 'react'
import serialize from 'serialize-javascript'

export default function JSONLD({
  jsonLd,
}: {
  jsonLd: Record<string, unknown>[]
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <script
      type="application/ld+json"
      // `serialize` escapes HTML characters (`<`, `>`, `/`) and the JS line
      // terminators, so that a value holding `</script>` cannot close the
      // element it is inlined in. `isJSON` keeps `JSON.stringify` semantics:
      // `undefined` values are omitted instead of being emitted as `undefined`.
      dangerouslySetInnerHTML={{
        __html: serialize(jsonLd, { isJSON: true }),
      }}
    />
  )
}
