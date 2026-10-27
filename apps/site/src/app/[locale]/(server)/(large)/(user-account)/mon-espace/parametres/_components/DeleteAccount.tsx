'use client'
import TransClient from '@/components/translation/trans/TransClient'
import { clickDeleteUserAccountButton } from '@/constants/tracking/trackers'
import Button from '@/design-system/buttons/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/design-system/shadcn/dialog'
import { trackEvent } from '@/utils/analytics/trackEvent'
import { TrashIcon } from 'lucide-react'
import { useDeleteUserAccount } from '../_hooks/useDeleteUserAccount'

export default function DeleteAccount() {
  const { deleteUserAccount, isPending } = useDeleteUserAccount()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          onClick={() => trackEvent(clickDeleteUserAccountButton)}
          variant="outlined"
          color="red">
          <TrashIcon className="stroke-red-700" />
          <TransClient i18nKey="mon-espace.settings.delete.button">
            Supprimer mon compte
          </TransClient>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <TransClient i18nKey="mon-espace.settings.delete.dialog.title">
              Suppression du compte
            </TransClient>
          </DialogTitle>
          <DialogDescription>
            <TransClient i18nKey="mon-espace.settings.delete.button">
              Cette action supprimera définitivement votre compte ainsi que
              l'ensemble de vos données associées : résultats, groupes,
              organisation.
              <br />
              <strong>Cette action est irréversible.</strong>
            </TransClient>
          </DialogDescription>
          <DialogFooter>
            <Button onClick={deleteUserAccount} color="red" loading={isPending}>
              <TransClient i18nKey="mon-espace.settings.delete.dialog.confirm">
                Confirmer la suppression
              </TransClient>
            </Button>
            <DialogClose asChild>
              <Button variant="outlined">
                <TransClient i18nKey="mon-espace.settings.delete.dialog.cancel">
                  Annuler
                </TransClient>
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
