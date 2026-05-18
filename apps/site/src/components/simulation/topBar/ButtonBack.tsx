'use client'

import ChevronLeft from '@/components/icons/ChevronLeft'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import Link from 'next/link'

export default function ButtonBack() {
  const { t } = useClientTranslation()

  return (
    <Link
      data-testid="back-button"
      className="relative block h-8 w-8"
      aria-label={t('Retour')}
      href="/">
      <ChevronLeft className="stroke-primary-700 h-auto w-full transition-transform hover:-translate-x-2" />
    </Link>
  )
}
