'use client'

import Error500 from '@/components/layout/500'
import logger from '@/logger/logger.browser'
import NextError from 'next/error'
import { useEffect } from 'react'

interface Props {
  error: Error & { digest?: string }
}
export default function GlobalError({ error }: Props) {
  useEffect(() => {
    // A digest marks an error the server already reported: Next replaces its
    // message and its stack with that hash, so a line here would carry neither,
    // and its generic message would be what names the PostHog issue — every
    // server render error under one title. The `onRequestError` net has the
    // real message, the stack and the digest; this one keeps the failures no
    // server saw.
    if (error.digest) {
      return
    }

    logger.error(error, { scope: 'site.view.globalError' })
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
