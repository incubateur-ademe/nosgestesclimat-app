'use client'

import CheckboxInput from '@/design-system/inputs/CheckboxInput'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useState } from 'react'
import { useCookieManagement } from '../cookies/useCookieManagement'

export default function DisablePosthogCheckbox() {
  const { cookieState, onChange } = useCookieManagement()

  const [isChecked, setIsChecked] = useState(
    cookieState.posthog !== 'do_not_track'
  )

  const { t } = useClientTranslation()

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked

    setIsChecked(newValue)
    onChange({
      ...cookieState,
      posthog: newValue ? 'refused' : 'do_not_track',
    })
  }

  return (
    <label
      htmlFor="posthog-checkbox"
      aria-label={t(
        'privacyPolicy.posthogCheckboxLabel',
        'Désactiver le suivi Posthog'
      )}
      className="mb-6 flex cursor-pointer items-center gap-2">
      <CheckboxInput
        data-testid="posthog-tracking-checkbox"
        type="checkbox"
        value={isChecked}
        onChange={handleCheckboxChange}
        label={
          isChecked
            ? t(
                'privacyPolicy.posthogCheckboxText',
                'Vous êtes suivi de façon anonyme par Posthog. Décochez cette case pour vous exclure également du suivi anonyme.'
              )
            : t(
                'privacyPolicy.posthogCheckboxTextNotFollowed',
                "Vous n'êtes actuellement pas suivi. Cochez cette case si vous acceptez d'être suivi de façon anonyme avec Posthog"
              )
        }
      />
    </label>
  )
}
