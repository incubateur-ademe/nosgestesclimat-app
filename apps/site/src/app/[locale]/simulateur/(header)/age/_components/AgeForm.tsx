'use client'

import ChoiceInput from '@/components/misc/ChoiceInput'
import Trans from '@/components/translation/trans/TransClient'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { useUpdateUserAgeRange } from '@/hooks/age/useUpdateUserAgeRange'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useUser } from '@/publicodes-state'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AgeForm() {
  const { t } = useClientTranslation()

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
      value: 'refused',
      label: t(
        'simulator.age.options.nonPrecise',
        'Je préfère ne pas le préciser ❌'
      ),
    },
  ]

  const router = useRouter()
  const { user } = useUser()
  const { mutateAsync: updateUser, isPending } = useUpdateUserAgeRange()

  const [selectedAge, setSelectedAge] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!selectedAge || isPending) return

    await updateUser({
      userId: user.userId,
      ageRange: selectedAge,
    })

    router.push(SIMULATOR_PATH)
    router.refresh()
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void handleSubmit()
      }}>
      <fieldset className="mt-2 flex flex-col gap-2">
        <legend className="sr-only">
          {t(
            'simulator.age.inputLabel',
            "Dans quelle tranche d'âge vous situez-vous ?"
          )}
        </legend>

        {AGE_OPTIONS.map((option) => {
          return (
            <ChoiceInput
              key={option.value}
              label={option.label}
              labelText={option.label}
              active={selectedAge === option.value}
              onClick={() => setSelectedAge(option.value)}
              data-testid={`age-choice-${option.value}`}
            />
          )
        })}
      </fieldset>

      <div className="mt-8 flex w-full flex-col items-stretch gap-2 pb-8 sm:flex-row md:items-stretch md:gap-4">
        <ButtonLink
          color="secondary"
          href={SIMULATOR_PATH}
          data-testid="skip-age-button">
          <Trans>Passer</Trans>
        </ButtonLink>

        <Button
          type="submit"
          disabled={!selectedAge || isPending}
          data-testid="submit-age-button">
          <Trans i18nKey="common.suivant">Suivant</Trans>
          <span aria-hidden className="ml-2 inline-block">
            →
          </span>
        </Button>
      </div>
    </form>
  )
}
