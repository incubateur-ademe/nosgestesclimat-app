'use client'

import DefaultSubmitErrorMessage from '@/components/error/DefaultSubmitErrorMessage'
import Trans from '@/components/translation/trans/TransClient'
import { linkToGroupCreation } from '@/constants/group'
import { ADMINISTRATOR_SEPARATOR } from '@/constants/organisations/administrator'
import {
  ORGANISATION_TYPES,
  OrganisationTypeEnum,
} from '@/constants/organisations/organisationTypes'
import Button from '@/design-system/buttons/Button'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import CheckboxInput from '@/design-system/inputs/CheckboxInput'
import SelectInput from '@/design-system/inputs/SelectInput'
import TextInput from '@/design-system/inputs/TextInput'
import Separator from '@/design-system/layout/Separator'
import { useCreateOrganisation } from '@/hooks/organisations/useCreateOrganisation'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useUser } from '@/publicodes-state'
import { captureException } from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm as useReactHookForm } from 'react-hook-form'

interface Inputs {
  name: string
  organisationType: OrganisationTypeEnum
  administratorFirstName: string
  administratorLastName: string
  administratorPosition: string
  hasOptedInForCommunications: boolean
}

export default function CreationForm() {
  const { user, updateUserOrganisation } = useUser()

  const { t } = useClientTranslation()

  const router = useRouter()

  const { register, handleSubmit, formState, watch } = useReactHookForm<Inputs>(
    {
      defaultValues: {},
    }
  )

  const { mutateAsync: createOrganisation, isError: isErrorUpdateOrga } =
    useCreateOrganisation()

  async function onSubmit({
    name,
    administratorFirstName,
    administratorLastName,
    administratorPosition,
    organisationType,
    hasOptedInForCommunications,
  }: Inputs) {
    try {
      const organisationUpdated = await createOrganisation({
        name,
        type: organisationType,
        administrators: [
          {
            name: `${administratorFirstName}${ADMINISTRATOR_SEPARATOR}${administratorLastName}`,
            position: administratorPosition,
            optedInForCommunications: hasOptedInForCommunications,
          },
        ],
      })

      updateUserOrganisation({
        name,
        slug: organisationUpdated?.slug,
      })

      router.push(`/organisations/${organisationUpdated?.slug}/creer-campagne`)
    } catch (error: unknown) {
      captureException(error)
    }
  }

  // Redirect to organisation page if user has already an organisation
  useEffect(() => {
    if (user?.organisation?.slug) {
      router.push(`/organisations/${user?.organisation?.slug}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-12">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextInput
          className="col-span-1"
          label={<Trans>Votre organisation</Trans>}
          autoComplete="organization"
          data-testid="organisation-name-input"
          error={formState.errors.name?.message}
          {...register('name', {
            required: t('Ce champ est requis'),
          })}
        />

        <div>
          <SelectInput
            containerClassName="pt-[3px]"
            label={<Trans>Type d'organisation</Trans>}
            data-testid="organisation-type-select"
            error={formState.errors.organisationType?.message}
            {...register('organisationType', {
              required: t('Ce champ est requis'),
            })}>
            {Object.entries(ORGANISATION_TYPES).map(([key, value]) => (
              <option className="cursor-pointer" key={key} value={key}>
                {value}
              </option>
            ))}
          </SelectInput>

          {watch('organisationType') ===
            OrganisationTypeEnum.groupOfFriends && (
            <div className="mt-4 rounded-xl bg-gray-100 p-4 text-sm">
              <p className="mb-2">
                <Trans>
                  Le mode organisation est un mode <strong>100% anonyme</strong>{' '}
                  pour les participants.
                </Trans>
              </p>

              <p className="mb-4">
                <Trans>
                  Avez-vous essayé{' '}
                  <strong>notre fonctionnalité “Groupes d’amis”</strong> ? Elle
                  vous permettra de vous comparer dans un classement : que celui
                  ou celle ayant la plus faible empreinte gagne !
                </Trans>
              </p>
              <ButtonLink href={linkToGroupCreation} size="sm">
                <Trans>Créer un groupe d'amis</Trans>
              </ButtonLink>
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextInput
          className="col-span-1"
          label={<Trans>Votre prénom</Trans>}
          autoComplete="given-name"
          data-testid="organisation-administrator-first-name-input"
          error={formState.errors.administratorFirstName?.message}
          {...register('administratorFirstName', {
            required: t('Ce champ est requis'),
          })}
        />

        <TextInput
          className="col-span-1"
          label={<Trans>Votre nom</Trans>}
          autoComplete="family-name"
          data-testid="organisation-administrator-last-name-input"
          error={formState.errors.administratorLastName?.message}
          {...register('administratorLastName', {
            required: t('Ce champ est requis'),
          })}
        />

        <TextInput
          className="col-span-1"
          autoComplete="organization-title"
          data-testid="organisation-administrator-position-input"
          label={
            <p className="mb-0 flex items-center justify-between">
              <Trans>Votre poste</Trans>
              <span className="text-secondary-700 text-sm italic">
                facultatif
              </span>
            </p>
          }
          {...register('administratorPosition')}
        />
      </div>

      <div className="mt-4 w-full md:w-1/2">
        <CheckboxInput
          size="xl"
          label={
            <span>
              <strong>
                <Trans>
                  Recevoir ponctuellement par e-mail les nouveaux services Nos
                  Gestes Climat aux organisations
                </Trans>
              </strong>{' '}
              <Trans>(une fois par mois maximum !)</Trans>
            </span>
          }
          {...register('hasOptedInForCommunications')}
        />
      </div>

      {isErrorUpdateOrga && <DefaultSubmitErrorMessage className="mt-4" />}

      <div className="mt-12">
        <Button type="submit" data-testid="create-organisation-button">
          <Trans>Créer ma première campagne</Trans>
        </Button>
      </div>
    </form>
  )
}
