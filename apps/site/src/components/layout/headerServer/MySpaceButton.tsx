import Trans from '@/components/translation/trans/TransServer'
import { captureClickHeaderMonEspaceUnauthenticatedServer } from '@/constants/tracking/posthogTrackers'
import { headerClickMonEspaceUnauthenticatedServer } from '@/constants/tracking/user-account'
import { CONNEXION_PATH } from '@/constants/urls/paths'
import ButtonLinkServer from '@/design-system/buttons/ButtonLinkServer'
import { logout } from '@/helpers/server/dal/user'
import { getAuthUser } from '@/helpers/server/model/user'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import MySpaceDropdown from './MySpaceDropdown'

async function logoutAndRedirect() {
  'use server'
  await logout()

  revalidatePath('/', 'layout')
  redirect('/')
}

export default async function MySpaceButton({ locale }: { locale: string }) {
  try {
    const user = await getAuthUser()
    return <MySpaceDropdown email={user.email} onLogout={logoutAndRedirect} />
  } catch {
    return (
      <ButtonLinkServer
        color="secondary"
        href={CONNEXION_PATH}
        data-track-event={headerClickMonEspaceUnauthenticatedServer}
        data-track-posthog={captureClickHeaderMonEspaceUnauthenticatedServer}>
        <Trans locale={locale} i18nKey="header.monEspace.title">
          Mon espace
        </Trans>
      </ButtonLinkServer>
    )
  }
}
