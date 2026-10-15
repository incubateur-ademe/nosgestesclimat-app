import ShareSimulationButton from '@/components/sharing/ShareSimulationButton'
import Trans from '@/components/translation/trans/TransServer'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import {
  UTM_MEDIUM_KEY,
  UTM_SOURCE_KEY,
} from '@nosgestesclimat/core/features/tracking/utm'

export default async function ShareSimulator() {
  const { t } = await getServerTranslation()

  const shareLink = `https://nosgestesclimat.fr${SIMULATOR_PATH}?${UTM_MEDIUM_KEY}=sharelink&${UTM_SOURCE_KEY}=NGC`

  return (
    <div className="py-8 text-center md:py-10">
      <p>
        <Trans i18nKey="mon-espace.shareSimulator.title">
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
          variant="filled"
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
          variant="filled"
          shouldHideTextOnMobile={false}
        />
      </span>
    </div>
  )
}
