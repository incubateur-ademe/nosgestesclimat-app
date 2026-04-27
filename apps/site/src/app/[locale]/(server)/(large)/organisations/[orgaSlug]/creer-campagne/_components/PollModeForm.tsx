'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import type { Organisation } from '@/types/organisations'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'
import { useCreatePollStep2 } from '../_hooks/useCreatePollStep2'
import { revalidationOrganisationPath } from './actions/revalidationOrganisationPath'

interface Props {
  organisation: Organisation
}

export default function PollModeForm({ organisation }: Props) {
  const { register, onSubmit, isPending, isError, modes } = useCreatePollStep2({
    organisationSlug: organisation.slug,
    revalidatePath: revalidationOrganisationPath,
  })

  return (
    <form
      className="mt-8"
      onSubmit={isPending ? () => {} : onSubmit}
      id="poll-form">
      <fieldset>
        <legend className="sr-only">
          <Trans>Choisissez le mode du test</Trans>
        </legend>
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-stretch">
          {modes.map((mode, index) => (
            <label
              key={mode.value}
              className={twMerge(
                'group relative flex w-60 cursor-pointer flex-col items-center rounded-xl border-2 p-6 transition-all',
                'has-checked:border-primary-700 has-checked:hover:border-primary-700 border-transparent hover:border-gray-200 has-[:checked]:shadow-lg',
                index === 0 ? 'bg-primary-50' : 'bg-slate-50'
              )}
              data-testid={`poll-mode-${mode.value}`}>
              <input
                type="radio"
                value={mode.value}
                className="sr-only"
                defaultChecked={mode.value === 'standard'}
                {...register('mode')}
              />
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                <Trans i18nKey={mode.titleKey}>{mode.titleDefault}</Trans>
              </h3>
              <p className="mb-4 text-center text-sm text-gray-700">
                <Trans i18nKey={mode.descriptionKey}>
                  {mode.descriptionDefault}
                </Trans>
              </p>
              <Image
                src={mode.imageSrc}
                alt={mode.imageAlt}
                width={200}
                height={150}
                className="my-auto mb-6"
              />
              <span className="group-has-checked:border-primary-700 group-has-checked:text-primary-700 mt-auto inline-flex items-center gap-2 justify-self-end rounded-full border-2 border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-600 transition-colors">
                <Trans>Sélectionner</Trans>
                <span className="group-has-checked:border-primary-700 flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-300">
                  <span className="bg-primary-700 hidden h-2 w-2 rounded-full group-has-checked:block" />
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {isError && (
        <p role="alert" aria-live="polite" className="mt-4 text-red-800">
          <Trans>
            Une erreur s'est produite lors de la création de votre test
            collectif. Veuillez réessayer.
          </Trans>
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        data-testid="poll-form-type-button"
        form="poll-form"
        className="mt-8 w-full sm:w-auto md:self-start">
        <Trans>Créer mon lien de test</Trans>

        <span aria-hidden className="ml-2 inline-block">
          →
        </span>
      </Button>
    </form>
  )
}
