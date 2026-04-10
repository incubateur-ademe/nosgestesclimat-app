import { END_PAGE_PATH } from '@/constants/urls/paths'
import { getLinkToTutoriel } from '@/helpers/navigation/simulateurPages'
import { useLocale } from '@/hooks/useLocale'
import { useCurrentSimulation, useUser } from '@/publicodes-state'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useSimulatorGuard() {
  const searchParams = useSearchParams()
  const locale = useLocale()
  const router = useRouter()
  const { tutorials } = useUser()
  const { progression } = useCurrentSimulation()
  const [isRedirecting] = useState(progression === 1 || !tutorials.testIntro)

  useEffect(() => {
    if (progression === 1) {
      router.replace(END_PAGE_PATH)
    }
    if (!tutorials.testIntro) {
      router.replace(getLinkToTutoriel({ locale, searchParams }))
    }
  }, [])
  return {
    isRedirecting,
  }
}
