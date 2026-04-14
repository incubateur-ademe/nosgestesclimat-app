'use client'

import { twMerge } from 'tailwind-merge'
import Link from '../Link'
import Trans from '../translation/trans/TransClient'

export default function DefaultSubmitErrorMessage({
  className,
}: {
  className?: string
}) {
  return (
    <span
      role="alert"
      data-testid="submit-error-message"
      className={twMerge(
        'mt-2 block text-sm font-medium text-red-800 dark:text-red-50',
        className
      )}>
      <Trans>
        Oups ! Une erreur s'est produite. Veuillez réessayer plus tard. Si le
        problème persiste, vous pouvez
      </Trans>{' '}
      <Link href="/contact" className="dark:text-primary-50">
        <Trans>nous contacter</Trans>
      </Link>
      .
    </span>
  )
}
