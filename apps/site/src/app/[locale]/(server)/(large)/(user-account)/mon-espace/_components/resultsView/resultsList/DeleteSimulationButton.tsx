'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import Modal from '@/design-system/modals/Modal'
import { useState } from 'react'

interface Props {
  simulationBlock: React.ReactNode
}

export function DeleteSimulationButton({ simulationBlock }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)

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
        buttons={[
          <Button key="submit" color="red">
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

        {simulationBlock}
      </Modal>
    </>
  )
}
