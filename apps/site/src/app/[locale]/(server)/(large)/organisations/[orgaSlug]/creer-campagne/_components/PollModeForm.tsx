'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import Badge from '@/design-system/layout/Badge'
import type { Organisation } from '@/types/organisations'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'
import { useCreatePollStep2 } from '../_hooks/useCreatePollStep2'

interface Props {
  organisation: Organisation
}

export default function PollModeForm({ organisation }: Props) {
  const { handleSubmit, isPending, isError, modes } = useCreatePollStep2({
    organisationSlug: organisation.slug,
  })

  return (
    <form className="mt-2" action={handleSubmit} id="poll-form">
      <fieldset>
        <legend className="sr-only">
          <Trans>Choisissez le mode du test</Trans>
        </legend>

        <div className="flex flex-row items-stretch gap-1 md:gap-8">
          {modes.map((mode, index) => (
            <label
              key={mode.value}
              className={twMerge(
                'group relative flex flex-1 cursor-pointer flex-col items-center rounded-xl border px-2 py-4 transition-all has-checked:shadow-lg md:w-60 md:flex-none md:p-6',
                index === 0
                  ? 'border-violet-500 bg-violet-50 hover:border-violet-700 has-checked:border-violet-700'
                  : 'border-slate-500 bg-slate-50 hover:border-slate-700 has-checked:border-slate-700'
              )}
              data-testid={`poll-mode-${mode.value}`}>
              {mode.value === 'scolaire' && (
                <Badge
                  size="sm"
                  color="secondary"
                  className="absolute -top-2 right-2 z-10 rounded-full drop-shadow-lg">
                  Beta
                </Badge>
              )}

              {/* Mobile radio dot */}
              <span className="group-has-checked:border-primary-700 mx-auto flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300 md:hidden">
                <span className="bg-primary-700 hidden h-3 w-3 rounded-full group-has-checked:block" />
              </span>

              <input
                type="radio"
                name="mode"
                value={mode.value}
                className="sr-only"
                defaultChecked={mode.value === 'standard'}
              />

              <h3 className="mt-3 mb-2 text-base font-bold text-gray-900 md:mt-0 md:text-lg">
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

                {/* Desktop radio dot */}
                <span className="group-has-checked:border-primary-700 hidden h-4 w-4 items-center justify-center rounded-full border-2 border-gray-300 md:flex">
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
        loading={isPending}
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
