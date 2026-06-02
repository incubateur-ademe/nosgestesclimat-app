'use client'

import { useAgeForm } from '@/app/[locale]/simulateur/(header)/age/_hooks/useAgeForm'
import ChoiceInput from '@/components/misc/ChoiceInput'
import Trans from '@/components/translation/trans/TransClient'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { AgeRange } from '@nosgestesclimat/core/features/users/types/age-range'

interface Props {
  ageRange: AgeRange | null
}

export default function AgeForm({ ageRange }: Props) {
  const { t } = useClientTranslation()

  const { options, selectedAge, setSelectedAge, isPending, handleSubmit } =
    useAgeForm({ t, defaultValue: ageRange })

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

        {options.map((option) => (
          <ChoiceInput
            key={option.value}
            label={option.label}
            labelText={option.label}
            active={selectedAge === option.value}
            onClick={() => setSelectedAge(option.value)}
            data-testid={`age-choice-${option.value}`}
          />
        ))}
      </fieldset>

      <div className="mt-8 flex w-full flex-col items-stretch gap-2 pb-8 sm:flex-row md:items-stretch md:gap-4">
        <Button
          type="submit"
          disabled={!selectedAge || isPending}
          data-testid="submit-age-button">
          <Trans i18nKey="common.suivant">Suivant</Trans>
          <span aria-hidden className="ml-2 inline-block">
            →
          </span>
        </Button>

        <ButtonLink
          color="secondary"
          href={SIMULATOR_PATH}
          data-testid="skip-age-button">
          <Trans>Passer</Trans>
        </ButtonLink>
      </div>
    </form>
  )
}
