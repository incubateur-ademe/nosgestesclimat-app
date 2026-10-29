'use client'
import Trans from '@/components/translation/trans/TransClient'
import { clickDeleteUserAccountButton } from '@/constants/tracking/trackers'
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
              l'ensemble de vos données associées : résultats, groupes,
              organisation.
            </Trans>
          </p>
          <p>
            <Trans i18nKey="mon-espace.settings.delete.dialog.description2">
              <strong>Cette action est irréversible.</strong>
            </Trans>
          </p>
          <DialogFooter>
            <Button onClick={deleteUserAccount} color="red" loading={isPending}>
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
