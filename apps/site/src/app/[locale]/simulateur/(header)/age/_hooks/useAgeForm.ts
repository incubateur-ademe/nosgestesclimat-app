import { END_PAGE_PATH, SIMULATOR_PATH } from '@/constants/urls/paths'
import { useUser } from '@/publicodes-state'
import {
  AgeRangeSchema,
  type AgeRange,
} from '@nosgestesclimat/core/features/users/types/age-range'
import type { TFunction } from 'i18next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useUpdateUserAgeRange } from './useUpdateUserAgeRange'

interface Props {
  t: TFunction
  defaultValue: AgeRange | null
}

const AGE_RANGE_LABEL_CONFIG: Record<
  AgeRange,
  { tKey: string; defaultLabel: string }
> = {
  under_18: {
    tKey: 'simulator.age.options.under18',
    defaultLabel: 'Moins de 18 ans',
  },
  age_18_24: {
    tKey: 'simulator.age.options.18-24',
    defaultLabel: '18 - 24 ans',
  },
  age_25_34: {
    tKey: 'simulator.age.options.25-34',
    defaultLabel: '25 - 34 ans',
  },
  age_35_49: {
    tKey: 'simulator.age.options.35-49',
    defaultLabel: '35 - 49 ans',
  },
  age_50_64: {
    tKey: 'simulator.age.options.50-64',
    defaultLabel: '50 - 64 ans',
  },
  over_65: {
    tKey: 'simulator.age.options.65AndMore',
    defaultLabel: '65 ans et plus',
  },
  undisclosed: {
    tKey: 'simulator.age.options.undisclosed',
    defaultLabel: 'Je préfère ne pas le préciser',
  },
}

export function useAgeForm({ t, defaultValue }: Props) {
  const router = useRouter()
  const { user, currentSimulation } = useUser()
  const { mutateAsync: updateUser, isPending } = useUpdateUserAgeRange()

  const AGE_OPTIONS = AgeRangeSchema.options.map((value) => ({
    value,
    label: t(
      AGE_RANGE_LABEL_CONFIG[value].tKey,
      AGE_RANGE_LABEL_CONFIG[value].defaultLabel
    ),
  }))

  const [selectedAge, setSelectedAge] = useState<AgeRange | null>(defaultValue)

  const handleSubmit = async () => {
    if (!selectedAge || isPending) return

    await updateUser({
      userId: user.userId,
      ageRange: selectedAge,
    })

    router.push(
      currentSimulation.progression === 1 ? END_PAGE_PATH : SIMULATOR_PATH
    )
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
