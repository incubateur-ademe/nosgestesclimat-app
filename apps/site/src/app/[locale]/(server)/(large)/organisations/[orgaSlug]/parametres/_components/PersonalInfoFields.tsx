'use client'

import Trans from '@/components/translation/trans/TransClient'
import TextInput from '@/design-system/inputs/TextInput'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { OrgaSettingsInputsType } from '@/types/organisations'

import type { UseFormRegister } from 'react-hook-form'

interface Props {
  defaultValues?: OrgaSettingsInputsType
  register: UseFormRegister<OrgaSettingsInputsType>
}

export default function PersonalInfoFields({ defaultValues, register }: Props) {
  const { t } = useClientTranslation()

  if (!defaultValues) return null

  return (
    <div className="flex flex-col gap-4">
      <TextInput
        label={<Trans>Votre prénom</Trans>}
        autoComplete="given-name"
        data-testid="input-administrator-first-name"
        value={defaultValues.administratorFirstName}
        data-tes
        {...register('administratorFirstName', {
          required: t('Ce champ est requis'),
        })}
      />

      <TextInput
        label={<Trans>Votre nom</Trans>}
        autoComplete="family-name"
        data-testid="input-administrator-last-name"
        value={defaultValues.administratorLastName}
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
        value={defaultValues.position}
        autoComplete="organization-title"
        {...register('position')}
      />

      <TextInput
        label={
          <p className="mb-0 flex w-full justify-between">
            <Trans>Votre téléphone</Trans>{' '}
            <span className="text-secondary-700 font-bold italic">
              {' '}
              <Trans>facultatif</Trans>
            </span>
          </p>
        }
        autoComplete="tel"
        value={defaultValues.administratorTelephone}
        {...register('administratorTelephone')}
      />
    </div>
  )
}
