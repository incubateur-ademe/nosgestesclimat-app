import Trans from '@/components/translation/trans/TransClient'
import ButtonLink from '@/design-system/buttons/ButtonLink'

export default function CreateOrganisationLink() {
  return (
    <ButtonLink variant="outlined" href="/organisations">
      <Trans>Créer un test collectif</Trans>
    </ButtonLink>
  )
}
