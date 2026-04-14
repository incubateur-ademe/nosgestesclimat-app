'use client'

import { postNewsletterFormAction } from '@/actions/newsletters/postNewsletterFormAction'
import NewsletterCheckBoxes from '@/components/newsletter/NewsletterCheckboxes'
import Trans from '@/components/translation/trans/TransClient'
import { captureClickUpdateUserNewsletters } from '@/constants/tracking/posthogTrackers'
import { clickUpdateUserNewsletters } from '@/constants/tracking/user-account'
import Alert from '@/design-system/alerts/alert/Alert'
import Button from '@/design-system/buttons/Button'
import EmailInput from '@/design-system/inputs/EmailInput'
import Loader from '@/design-system/layout/Loader'
import {
  type ListIds,
  type Newsletters,
} from '@/helpers/server/model/newsletter'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import Form from 'next/form'
import { useActionState } from 'react'
import { useTranslation } from 'react-i18next'

interface NewsletterFormProps {
  newsletters: Newsletters
  listIds?: ListIds
}

export default function NewsletterForm({ newsletters }: NewsletterFormProps) {
  const { t } = useTranslation()
  const [state, formAction, pending] = useActionState(
    postNewsletterFormAction,
    {
      email: '',
      listIds: [],
    }
  )

  return (
    <div className="w-xl max-w-full">
      <Form action={formAction} noValidate>
        <NewsletterCheckBoxes
          newsletters={newsletters}
          defaultListIds={state.listIds}
        />

        <EmailInput
          required
          containerClassName="my-8"
          value={state.email}
          error={
            state.error === 'EMAIL_INVALID'
              ? t(
                  'ui.emailInput.error.invalid',
                  'Veuillez entrer une adresse e-mail valide (format attendu : nom@exemple.org)'
                )
              : state.error === 'EMAIL_REQUIRED'
                ? t(
                    'ui.emailInput.error.required',
                    'Veuillez entrer une adresse e-mail'
                  )
                : undefined
          }
        />

        <Button
          type="submit"
          className="mb-8 h-14 w-60"
          disabled={pending}
          onClick={() => {
            trackMatomoEvent__deprecated(clickUpdateUserNewsletters)
            trackPosthogEvent(captureClickUpdateUserNewsletters)
          }}>
          {pending ? (
            <Loader size="sm" color="light" />
          ) : (
            <span data-testid="default-submit-label">
              <Trans i18nKey="newsletterManagement.saveSubscriptions">
                Valider mon inscription
              </Trans>
            </span>
          )}
        </Button>
      </Form>

      {!pending && state.success && (
        <Alert
          aria-live="polite"
          className="mb-6"
          description={
            <div>
              <p className="font-bold">
                <Trans i18nKey="newsletterManagement.success.unauthenticated.title">
                  Un e-mail vient de vous être envoyé
                </Trans>
              </p>
              <p className="mb-0">
                <Trans i18nKey="newsletterManagement.success.unauthenticated.description">
                  Consultez votre boîte de réception et confirmez votre adresse
                  pour recevoir nos e-mails.
                </Trans>
              </p>
            </div>
          }
        />
      )}

      {!pending && state.error === 'SERVER_ERROR' && (
        <Alert
          aria-live="polite"
          className="mb-6"
          description={
            <Trans i18nKey="newsletterManagement.error.title">
              Une erreur est survenue lors de la mise à jour des informations.
            </Trans>
          }
        />
      )}

      <p
        data-testid="unverified-message"
        className="mb-0 text-sm text-gray-600">
        <Trans i18nKey="newsletterManagement.message.unauthenticated">
          Pour vous désinscrire, passez par le lien en bas de l'e-mail reçu
        </Trans>
      </p>
    </div>
  )
}
