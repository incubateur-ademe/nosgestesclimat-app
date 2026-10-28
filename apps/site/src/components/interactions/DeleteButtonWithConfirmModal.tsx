'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import Loader from '@/design-system/layout/Loader'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/design-system/shadcn/dialog'
import { useState, useTransition } from 'react'

interface Props {
  children: React.ReactNode
  deleteAction: () => Promise<void>
}

export function DeleteButtonWithConfirmModal({
  children,
  deleteAction,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDeleteAction = () => {
    setIsError(false)

    startTransition(async () => {
      try {
        await deleteAction()

        setIsModalOpen(false)
      } catch {
        setIsError(true)
      }
    })
  }

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={(open) => {
        if (!isPending) {
          setIsModalOpen(open)
        }
      }}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          data-testid="delete-simulation-button"
          className="font-normal text-red-700 hover:text-red-800">
          <Trans i18nKey="mySpace.resultList.item.delete.mainButton.label">
            Supprimer
          </Trans>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          {children}

          {isError && (
            <p className="mt-2 text-red-700">
              <Trans i18nKey="mySpace.resultList.item.delete.modal.error">
                Une erreur s'est produite au moment de supprimer cet élément.
                Veuillez réessayer.
              </Trans>
            </p>
          )}
        </DialogHeader>

        <DialogFooter showCancelButton>
          <Button
            disabled={isPending}
            onClick={handleDeleteAction}
            color="red"
            data-testid="confirm-delete-simulation-button">
            {isPending && <Loader color="light" className="mr-2" />}
            <Trans i18nKey="mySpace.resultList.item.delete.modal.confirm">
              Confirmer la suppression
            </Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
