import { SIMULATOR_PATH } from '@/constants/urls/paths'
import { t } from '@/helpers/metadata/fakeMetadataT'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function useUpdatePageTitle({
  category,
  countCategoryQuestions,
  currentQuestionIndex,
}: {
  category: string
  countCategoryQuestions: number
  currentQuestionIndex: number
}) {
  const path = usePathname()

  const isOnSimulationPath = path.startsWith(SIMULATOR_PATH)

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined' &&
      isOnSimulationPath
    ) {
      document.title = t(
        'Calculateur d’empreinte carbone et eau - Nos Gestes Climat'
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update the page title when the question changes
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined' &&
      isOnSimulationPath
    ) {
      document.title = t(
        `Calculateur, question ${currentQuestionIndex} sur ${countCategoryQuestions} de la catégorie ${category} - Nos Gestes Climat`
      )
    }
  }, [
    category,
    currentQuestionIndex,
    countCategoryQuestions,
    isOnSimulationPath,
  ])
}
