'use client'

import Trans from '@/components/translation/trans/TransClient'
import TextInput from '@/design-system/inputs/TextInput'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { OrgaSettingsInputsType } from '@/types/organisations'

import type { UseFormRegister } from 'react-hook-form'

interface Props {
  register: UseFormRegister<OrgaSettingsInputsType>
}

export default function PersonalInfoFields({ register }: Props) {
  const { t } = useClientTranslation()

  return (
    <div className="flex flex-col gap-4">
      <TextInput
        label={<Trans>Votre prénom</Trans>}
        autoComplete="given-name"
        data-testid="input-administrator-first-name"
        data-tes
        {...register('administratorFirstName', {
          required: t('Ce champ est requis'),
        })}
      />

      <TextInput
        label={<Trans>Votre nom</Trans>}
        autoComplete="family-name"
        data-testid="input-administrator-last-name"
        {...register('administratorLastName', {
          required: t('Ce champ est requis'),
        })}
      />

      <TextInput
        label={
          <p className="mb-0 flex items-center justify-between">
            <Trans>Votre poste</Trans>
            <span className="text-secondary-700 text-sm italic">
              <Trans>facultatif</Trans>
            </span>
          </p>
        }
        autoComplete="organization-title"
        {...register('position')}
      />

      <TextInput
        label={
          <p className="mb-0 flex w-full justify-between">
            <Trans>Votre téléphone</Trans>
            <span className="text-secondary-700 font-bold italic">
              <Trans>facultatif</Trans>
            </span>
          </p>
        }
        autoComplete="tel"
        {...register('administratorTelephone')}
      />
    </div>
  )
}
