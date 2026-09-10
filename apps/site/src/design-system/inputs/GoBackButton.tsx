'use client'

import Trans from '@/components/translation/trans/TransClient'

interface Props {
  className?: string
}

export default function GoBackButton({ className }: Props) {
  return (
    <button
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.history.back()
        }
      }}
      className={`${className} text-primary-700 inline-block px-0 text-[1rem]! no-underline transition-opacity hover:opacity-80`}>
      ← <Trans>Retour</Trans>
    </button>
  )
}
