'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import Loader from '@/design-system/layout/Loader'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/design-system/shadcn/dialog'
import { useState, useTransition } from 'react'

interface Props {
  children: React.ReactNode
  simulationId: string
  userId: string
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
        <Button variant="link" color="red" className="font-normal">
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

        <DialogFooter>
          <Button disabled={isPending} onClick={handleDeleteAction} color="red">
            {isPending && <Loader color="light" className="mr-2" />}
            <Trans i18nKey="mySpace.resultList.item.delete.modal.confirm">
              Confirmer la suppression
            </Trans>
          </Button>

          <DialogClose asChild>
            <Button variant="outlined" disabled={isPending}>
              <Trans i18nKey="common.cancel">Annuler</Trans>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
