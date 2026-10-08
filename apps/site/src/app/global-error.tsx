'use client'

import Error500 from '@/components/layout/500'
import logger from '@/logger/logger.browser'
import { toError } from '@nosgestesclimat/core/lib/to-error'
import NextError from 'next/error'
import { useEffect } from 'react'

interface Props {
  error: unknown
}
export default function GlobalError({ error }: Props) {
  useEffect(() => {
    // Server-rendered errors carry a digest: `onRequestError` already reported
    // them, with the real message and stack. React hands the boundary whatever
    // was thrown, so the digest is probed off an unknown value.
    if (typeof error === 'object' && error !== null && 'digest' in error) {
      return
    }

    logger.error(toError(error), { scope: 'site.view.globalError' })
  }, [error])

  return (
    <html lang="fr">
      <body style={{ backgroundColor: 'white', fontFamily: 'sans-serif' }}>
        <Error500 />

        <NextError statusCode={500} />
      </body>
    </html>
  )
}
