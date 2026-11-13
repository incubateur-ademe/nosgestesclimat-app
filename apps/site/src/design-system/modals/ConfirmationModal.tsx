'use client'

import Trans from '@/components/translation/trans/TransClient'
import type { ReactNode } from 'react'
import Button from '../buttons/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '../shadcn/dialog'

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
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !loading) {
          closeModal()
        }
      }}>
      <DialogContent aria-label={ariaLabel} aria-labelledby={ariaLabelledBy}>
        <DialogHeader>{children}</DialogHeader>

        <DialogFooter>
          <Button
            color="red"
            disabled={disabled}
            loading={loading}
            className="w-35"
            onClick={onConfirm}>
            <Trans i18nKey="common.confirm">Confirmer</Trans>
          </Button>

          <DialogClose asChild>
            <Button variant="outlined" disabled={disabled || loading}>
              <Trans i18nKey="common.cancel">Annuler</Trans>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
