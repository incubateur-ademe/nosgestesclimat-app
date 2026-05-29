import ShareSimulationButton from '@/components/sharing/ShareSimulationButton'
import Trans from '@/components/translation/trans/TransServer'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'

interface Props {
  locale: Locale
}

export default async function ShareSimulator({ locale }: Props) {
  const { t } = await getServerTranslation({ locale })

  const shareLink = `https://nosgestesclimat.fr${SIMULATOR_PATH}?utm_medium=sharelink&utm_source=NGC`

  return (
    <div className="py-8 text-center md:py-10">
      <p>
        <Trans locale={locale} i18nKey="mon-espace.shareSimulator.title">
          Vous avez aimé calculer votre empreinte ?
        </Trans>
      </p>

      <span className="hidden md:block">
        <ShareSimulationButton
          url={shareLink}
          buttonLabel={t(
            'mon-espace.shareSimulator.buttonLabel.desktop',
            'Partager le test Nos Gestes Climat'
          )}
          buttonColor="borderless"
          shouldHideTextOnMobile={false}
        />
      </span>
      <span className="block md:hidden">
        <ShareSimulationButton
          url={shareLink}
          buttonLabel={t(
            'mon-espace.shareSimulator.buttonLabel.mobile',
            'Partager le test'
          )}
          buttonColor="borderless"
          shouldHideTextOnMobile={false}
        />
      </span>
    </div>
  )
}
