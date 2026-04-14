import Trans from '@/components/translation/trans/TransServer'
import { CONNEXION_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Title from '@/design-system/layout/Title'
import { getLocaleFromHeaders } from '@/helpers/server/getLocaleForNotFoundOrUnautorizedPage'
import ErrorPage from './_components/ErrorPage'

export default async function Unauthorized() {
  const locale = await getLocaleFromHeaders()
  return (
    <ErrorPage locale={locale}>
      <Trans i18nKey="pages.result.unauthorized" locale={locale}>
        <Title tag="h1">Ces résultats sont protégés</Title>
        <p>
          Pour y accéder, vous devez vous connecter avec le même e-mail que
          celui utilisé lors de leur sauvegarde.
        </p>
        <ButtonLink href={CONNEXION_PATH}>Me connecter</ButtonLink>
      </Trans>
    </ErrorPage>
  )
}
