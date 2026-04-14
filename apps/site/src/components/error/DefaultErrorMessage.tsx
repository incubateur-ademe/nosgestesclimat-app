'use client'
import { twMerge } from 'tailwind-merge'
import Link from '../Link'
import Trans from '../translation/trans/TransClient'

export default function DefaultErrorMessage({
  className,
}: {
  className?: string
}) {
  return (
    <span className={twMerge('block text-sm text-red-800', className)}>
      <Trans>
        Oups ! Une erreur s'est produite. Veuillez recharger la page. Si le
        problème persiste, vous pouvez
      </Trans>{' '}
      <Link href="/contact">
        <Trans>nous contacter</Trans>
      </Link>
      .
    </span>
  )
}
