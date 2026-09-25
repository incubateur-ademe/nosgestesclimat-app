'use client'
import Link from '../Link'
import Trans from '../translation/trans/TransClient'
import { twMerge } from "cn";

export default function DefaultUnautorizedMessage({
  className,
}: {
  className?: string
}) {
  return (
    <span className={twMerge('block text-sm text-red-800', className)}>
      <Trans>
        Oups ! Vous n'êtes pas autorisé à accéder à cette page. Si vous pensez
        que c'est une erreur, vous pouvez
      </Trans>{' '}
      <Link href="/contact">
        <Trans>nous contacter</Trans>
      </Link>
      .
    </span>
  )
}
