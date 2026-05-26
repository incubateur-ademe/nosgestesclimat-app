import { useUpdateUserAgeRange } from '@/app/[locale]/simulateur/(header)/age/_hooks/useUpdateUserAgeRange'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import { useUser } from '@/publicodes-state'
import {
  AgeRangeSchema,
  type AgeRange,
} from '@nosgestesclimat/core/features/users/types/age-range'
import type { TFunction } from 'i18next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  t: TFunction
  defaultValue: AgeRange | null
}

export function useAgeForm({ t, defaultValue }: Props) {
  const router = useRouter()
  const { user } = useUser()
  const { mutateAsync: updateUser, isPending } = useUpdateUserAgeRange()

  const AGE_RANGE_LABEL_CONFIG: Record<
    AgeRange,
    { tKey: string; defaultLabel: string }
  > = {
    under_18: {
      tKey: 'simulator.age.options.moinsDe18Ans',
      defaultLabel: 'Moins de 18 ans',
    },
    '18-24': {
      tKey: 'simulator.age.options.18-24',
      defaultLabel: '18 - 24 ans',
    },
    '25-34': {
      tKey: 'simulator.age.options.25-34',
      defaultLabel: '25 - 34 ans',
    },
    '35-49': {
      tKey: 'simulator.age.options.35-49',
      defaultLabel: '35 - 49 ans',
    },
    '50-64': {
      tKey: 'simulator.age.options.50-64',
      defaultLabel: '50 - 64 ans',
    },
    over_65: {
      tKey: 'simulator.age.options.65EtPlus',
      defaultLabel: '65 ans et plus',
    },
    undisclosed: {
      tKey: 'simulator.age.options.nonPrecise',
      defaultLabel: 'Je préfère ne pas le préciser ❌',
    },
  }

  const AGE_OPTIONS = (Object.keys(AgeRangeSchema.enum) as AgeRange[]).map(
    (value) => ({
      value,
      label: t(
        AGE_RANGE_LABEL_CONFIG[value].tKey,
        AGE_RANGE_LABEL_CONFIG[value].defaultLabel
      ),
    })
  )

  const [selectedAge, setSelectedAge] = useState<AgeRange | null>(defaultValue)

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
