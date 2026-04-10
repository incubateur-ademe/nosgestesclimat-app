'use client'
import Trans from '@/components/translation/trans/TransClient'
import Form from '@/design-system/form/Form'
import Separator from '@/design-system/layout/Separator'
import { useUpdateOrganisation } from '@/hooks/organisations/useUpdateOrganisation'
import type { OrgaSettingsInputsType } from '@/types/organisations'
import { captureException } from '@sentry/nextjs'
import {
  type SubmitHandler,
  useForm as useReactHookForm,
} from 'react-hook-form'
import OrganisationFields from './OrganisationFields'
import PersonalInfoFields from './PersonalInfoFields'

export default function OrganisationForm({
  defaultValues,
  slug,
}: {
  defaultValues: OrgaSettingsInputsType
  slug: string
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useReactHookForm({
    defaultValues,
  })

  const updateOrganisation = useUpdateOrganisation()

  const handleUpdateOrganisation: SubmitHandler<
    OrgaSettingsInputsType
  > = async (formData) => {
    try {
      await updateOrganisation.mutateAsync({
        organisationIdOrSlug: slug,
        formData,
      })
    } catch (error) {
      captureException(error)
    }
  }

  return (
    <>
      <Form
        className="mt-8 mb-4"
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          void handleSubmit(handleUpdateOrganisation)(e)
        }}>
        <h2>
          <Trans>Votre organisation</Trans>
        </h2>

        <OrganisationFields
          defaultValues={defaultValues}
          register={register}
          errors={errors}
        />

        <Separator className="my-6" />

        <h2 className="mt-6">
          <Trans>Vos informations personnelles</Trans>
        </h2>

        <PersonalInfoFields defaultValues={defaultValues} register={register} />

        {updateOrganisation.isSuccess && (
          <p className="mt-4 mb-0 text-green-700" data-testid="success-message">
            <Trans>Vos informations ont bien été mises à jour.</Trans>
          </p>
        )}
      </Form>
    </>
  )
}
