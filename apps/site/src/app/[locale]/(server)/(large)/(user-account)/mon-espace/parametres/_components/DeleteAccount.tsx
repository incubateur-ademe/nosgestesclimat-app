'use client'
import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/design-system/shadcn/dialog'
import { TrashIcon } from 'lucide-react'
import { useEraseUserAccount } from '../_hooks/useEraseUserAccount'

export default function DeleteAccount() {
  const { eraseUserAccount, isPending } = useEraseUserAccount()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outlined" color="red">
          <TrashIcon className="mr-2 size-5" />
          <Trans i18nKey="mon-espace.settings.delete.button">
            Supprimer mon compte
          </Trans>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey="mon-espace.settings.delete.dialog.title">
              Suppression du compte
            </Trans>
          </DialogTitle>
          <p className="mb-2">
            <Trans i18nKey="mon-espace.settings.delete.dialog.description1">
              Cette action supprimera définitivement votre compte ainsi que
              l'ensemble de vos données associées : vos résultats et vos groupes
              créés.
            </Trans>
          </p>
          <p>
            <Trans i18nKey="mon-espace.settings.delete.dialog.description2">
              <strong>Cette action est irréversible.</strong>
            </Trans>
          </p>
          {/* The shared footer stacks in reverse, which shows « Annuler »
              first: on mobile the confirmation goes on top instead. */}
          <DialogFooter className="max-sm:flex-col">
            <Button onClick={eraseUserAccount} color="red" loading={isPending}>
              <Trans i18nKey="mon-espace.settings.delete.dialog.confirm">
                Confirmer la suppression
              </Trans>
            </Button>
            <DialogClose asChild>
              <Button variant="outlined">
                <Trans i18nKey="mon-espace.settings.delete.dialog.cancel">
                  Annuler
                </Trans>
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
