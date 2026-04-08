'use client'

import {
  type NewsletterFormState,
  postNewsletterFormAction,
} from '@/actions/newsletters/postNewsletterFormAction'
import NewsletterCheckBoxes from '@/components/newsletter/NewsletterCheckboxes'
import { captureClickUpdateUserNewsletters } from '@/constants/tracking/posthogTrackers'
import { clickUpdateUserNewsletters } from '@/constants/tracking/user-account'
import Alert from '@/design-system/alerts/alert/Alert'
import Button from '@/design-system/buttons/Button'

import Trans from '@/components/translation/trans/TransClient'
import Loader from '@/design-system/layout/Loader'
import type { ListIds, Newsletters } from '@/helpers/server/model/newsletter'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import Form from 'next/form'
import { useActionState } from 'react'

interface Props {
  subscriptions: {
    email: string
    listIds: ListIds
  }
  newsletters: Newsletters
}

export default function NewsletterSettings({
  subscriptions,
  newsletters,
}: Props) {
  const [state, formAction, pending] = useActionState<
    NewsletterFormState,
    FormData
  >(postNewsletterFormAction, subscriptions)
  return (
    <div className="w-xl max-w-full">
      <Form
        action={formAction}
        noValidate
        className="mb-8 flex flex-col items-start gap-4">
        <input type="hidden" name="email" value={state.email} />
        <NewsletterCheckBoxes
          newsletters={newsletters}
          defaultListIds={state.listIds}
        />

        <Button
          type="submit"
          className="mt-8 h-14 w-72"
          disabled={pending}
          onClick={() => {
            trackMatomoEvent__deprecated(clickUpdateUserNewsletters)
            trackPosthogEvent(captureClickUpdateUserNewsletters)
          }}>
          {pending ? (
            <Loader size="sm" color="light" />
          ) : (
            <span data-testid="default-submit-label" className="text-sm">
              <Trans>Mettre à jour mes abonnements</Trans>
            </span>
          )}
        </Button>
      </Form>

      {!pending && state.success && (
        <Alert
          aria-live="polite"
          className="mt-6"
          description={
            <div>
              <p className="font-bold">
                <Trans i18nKey="newsletterManagement.success.authenticated.title">
                  Confirmation de votre choix
                </Trans>
              </p>
              <p className="mb-0">
                <Trans i18nKey="newsletterManagement.success.authenticated.description">
                  Nous avons bien pris en compte votre demande.
                </Trans>
              </p>
            </div>
          }
        />
      )}

      {!pending && state.error && (
        <Alert
          aria-live="polite"
          className="mt-6"
          description={
            <Trans i18nKey="newsletterManagement.error.title">
              Une erreur est survenue lors de la mise à jour des informations.
            </Trans>
          }
        />
      )}

      <p
        data-testid="verified-message"
        className="mt-4 mb-0 text-sm text-gray-600">
        <Trans i18nKey="newsletterManagement.message.authenticated">
          Vous pouvez vous désinscrire à tout moment en un clic !
        </Trans>
      </p>
    </div>
  )
}
