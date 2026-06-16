'use client'

import Trans from '@/components/translation/trans/TransClient'
import type { ReactNode } from 'react'
import Button from '../buttons/Button'
import Modal from './Modal'

interface Props {
  onConfirm: () => void
  closeModal: () => void
  loading?: boolean
  children: ReactNode
  ariaLabel?: string
  ariaLabelledBy?: string
  disabled?: boolean
}

export default function ConfirmationModal({
  onConfirm,
  closeModal,
  children,
  loading,
  ariaLabel,
  ariaLabelledBy,
  disabled,
}: Props) {
  return (
    <Modal
      ariaLabel={ariaLabel}
      ariaLabelledBy={ariaLabelledBy}
      isOpen
      closeModal={closeModal}
      hasAbortButton={false}>
      <div>{children}</div>

      <div className="mt-12 flex flex-wrap justify-center gap-4 md:justify-normal">
        <Button
          disabled={disabled}
          color="secondary"
          onClick={!loading ? closeModal : () => {}}>
          <Trans>Annuler</Trans>
        </Button>

        <Button
          color="primary"
          disabled={disabled}
          loading={loading}
          className="xs:order-2 -order-1 w-[140px]"
          onClick={!loading ? onConfirm : () => {}}>
          <Trans>Confirmer</Trans>
        </Button>
      </div>
    </Modal>
  )
}
