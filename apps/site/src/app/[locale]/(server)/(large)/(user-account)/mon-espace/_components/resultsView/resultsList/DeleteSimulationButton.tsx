'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import Loader from '@/design-system/layout/Loader'
import Modal from '@/design-system/modals/Modal'
import { deleteSimulation } from '@/helpers/server/model/simulations'
import type { Locale } from '@/i18nConfig'
import type { Simulation } from '@/publicodes-state/types'
import { useState, useTransition } from 'react'
import { ResultListItem } from './ResultListItem'

interface Props {
  simulation: Simulation
  userId: string
  locale: Locale
}

export function DeleteSimulationButton({ simulation, userId, locale }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDeleteSimulation = () => {
    setIsError(false)

    startTransition(async () => {
      try {
        await deleteSimulation({
          simulationId: simulation.id,
          userId,
        })

        setIsModalOpen(false)
      } catch {
        setIsError(true)
      }
    })
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        color="link"
        className="font-normal text-red-700 hover:text-red-800">
        <Trans i18nKey="mySpace.resultList.item.delete.mainButton.label">
          Supprimer
        </Trans>
      </Button>

      <Modal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        isLoading={isPending}
        buttons={[
          <Button
            disabled={isPending}
            onClick={handleDeleteSimulation}
            key="submit"
            color="red">
            {isPending && <Loader color="light" className="mr-2" />}
            <Trans i18nKey="mySpace.resultList.item.delete.modal.confirm">
              Confirmer la suppression
            </Trans>
          </Button>,
        ]}>
        <h2 className="mb-8 text-2xl font-normal">
          <Trans i18nKey="mySpace.resultList.item.delete.modal.title">
            Êtes-vous sûr(e) de vouloir supprimer ce résultat&nbsp;?
          </Trans>
        </h2>

        <ResultListItem simulation={simulation} locale={locale} />

        {isError && (
          <p className="mt-2 text-red-700">
            <Trans i18nKey="mySpace.resultList.item.delete.modal.error">
              Une erreur s'est produite au moment de supprimer votre résultat.
              Veuillez réessayer.
            </Trans>
          </p>
        )}
      </Modal>
    </>
  )
}
