'use client'

import Error500 from '@/components/layout/500'
import { captureErrorForSentryAndPosthog } from '@/utils/analytics/captureErrorForSentryAndPosthog'
import NextError from 'next/error'
import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
}
export default function GlobalError({ error }: Props) {
  useEffect(() => {
    captureErrorForSentryAndPosthog(error)
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
