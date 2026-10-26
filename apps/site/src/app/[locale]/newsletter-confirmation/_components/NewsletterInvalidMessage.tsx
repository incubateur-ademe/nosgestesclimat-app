import Trans from '@/components/translation/trans/TransServer'
import { MON_ESPACE_SETTINGS_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import MessageTemplate from '../../../../components/layout/MessageTemplate'

export default async function NewsletterInvalidMessage() {
  const { t } = await getServerTranslation()
  return (
    <MessageTemplate
      title={t("L'invitation a expiré")}
      description={t(
        'Vous devez recommencer votre inscription et valider votre e-mail.'
      )}
      buttonElement={
        <>
          <ButtonLink variant="outlined" href="/">
            <Trans>Revenir à la page d'accueil</Trans>
          </ButtonLink>

          <ButtonLink href={MON_ESPACE_SETTINGS_PATH}>
            <Trans>Recommencer mon inscription</Trans>
          </ButtonLink>
        </>
      }
    />
  )
}
