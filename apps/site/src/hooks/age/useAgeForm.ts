import { SIMULATOR_PATH } from '@/constants/urls/paths'
import { useUpdateUserAgeRange } from '@/hooks/age/useUpdateUserAgeRange'
import { useUser } from '@/publicodes-state'
import type { AgeRange } from '@nosgestesclimat/core/features/users/types/age-range'
import type { TFunction } from 'i18next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  t: TFunction
}

export function useAgeForm({ t }: Props) {
  const router = useRouter()
  const { user } = useUser()
  const { mutateAsync: updateUser, isPending } = useUpdateUserAgeRange()

  const AGE_OPTIONS = [
    {
      value: 'under_18',
      label: t('simulator.age.options.moinsDe18Ans', 'Moins de 18 ans'),
    },
    { value: '18-24', label: t('simulator.age.options.18-24', '18 - 24 ans') },
    { value: '25-34', label: t('simulator.age.options.25-34', '25 - 34 ans') },
    { value: '35-49', label: t('simulator.age.options.35-49', '35 - 49 ans') },
    { value: '50-64', label: t('simulator.age.options.50-64', '50 - 64 ans') },
    {
      value: 'over_65',
      label: t('simulator.age.options.65EtPlus', '65 ans et plus'),
    },
    {
      value: 'undisclosed',
      label: t(
        'simulator.age.options.nonPrecise',
        'Je préfère ne pas le préciser ❌'
      ),
    },
  ]

  const [selectedAge, setSelectedAge] = useState<AgeRange | null>(null)

  const handleSubmit = async () => {
    if (!selectedAge || isPending) return

    await updateUser({
      userId: user.userId,
      ageRange: selectedAge,
    })

    router.push(SIMULATOR_PATH)
    router.refresh()
  }

  return {
    selectedAge,
    setSelectedAge,
    isPending,
    handleSubmit,
    options: AGE_OPTIONS,
  }
}
