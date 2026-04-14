'use client'

import TrashIcon from '@/components/icons/TrashIcon'
import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import ConfirmationModal from '@/design-system/modals/ConfirmationModal'
import { useDeletePoll } from '@/hooks/organisations/polls/useDeletePoll'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { captureException } from '@sentry/nextjs'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeletePollButton() {
  const [isOpen, setIsOpen] = useState(false)

  const { t } = useClientTranslation()

  const { orgaSlug } = useParams()

  const router = useRouter()

  const { mutateAsync: deletePoll, error } = useDeletePoll()

  async function handleDeletePoll() {
    try {
      await deletePoll()

      router.push(`/organisations/${orgaSlug}`)
    } catch (error) {
      captureException(error)
    }
  }

  return (
    <>
      <Button color="link" onClick={() => setIsOpen(true)}>
        <TrashIcon className="fill-primary-700 mr-2 w-4" />
        <Trans>Supprimer cette campagne</Trans>
      </Button>

      {error && (
        <div className="mt-4 text-red-800">
          <Trans>
            Une erreur est survenue lors de la suppression de la campagne.
          </Trans>
        </div>
      )}

      {isOpen && (
        <ConfirmationModal
          ariaLabel={t(
            'organisations.polls.settings.confirmDeletion',
            'Fenêtre modale de confirmation de suppression de la campagne'
          )}
          ariaLabelledBy="delete-poll-title"
          closeModal={() => setIsOpen(false)}
          onConfirm={handleDeletePoll}>
          <h2 id="delete-poll-title">
            <Trans>Supprimer cette campagne ?</Trans>
          </h2>
          <p>
            <Trans>Cette opération est définitive.</Trans>
          </p>
        </ConfirmationModal>
      )}
    </>
  )
}
