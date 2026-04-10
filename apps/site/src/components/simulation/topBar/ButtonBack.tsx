'use client'

import ChevronLeft from '@/components/icons/ChevronLeft'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useRouter } from 'next/navigation'

export default function ButtonBack() {
  const { t } = useClientTranslation()
  const router = useRouter()

  return (
    <button
      data-testid="back-button"
      className="relative block h-8 w-8"
      aria-label={t('Retour')}
      onClick={() => router.push('/')}>
      <ChevronLeft className="stroke-primary-700 h-auto w-full transition-transform hover:-translate-x-2" />
    </button>
  )
}
