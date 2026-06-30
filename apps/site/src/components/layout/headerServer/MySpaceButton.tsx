import Trans from '@/components/translation/trans/TransServer'
import { captureClickHeaderMonEspaceUnauthenticatedServer } from '@/constants/tracking/posthogTrackers'
import { headerClickMonEspaceUnauthenticatedServer } from '@/constants/tracking/user-account'
import { CONNEXION_PATH } from '@/constants/urls/paths'
import ButtonLinkServer from '@/design-system/buttons/ButtonLinkServer'
import { getUserSession } from '@/services/auth/get-user-session'
import { logout } from '@/services/auth/logout'
import MySpaceDropdown from './MySpaceDropdown'

export default async function MySpaceButton({ locale }: { locale: string }) {
  const user = await getUserSession()
  if (user?.isAuth) {
    return <MySpaceDropdown email={user.email} onLogout={logout} />
  }

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
