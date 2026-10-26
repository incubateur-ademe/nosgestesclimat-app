import WaterDropIcon from '@/components/icons/WaterDropIcon'
import Trans from '@/components/translation/trans/TransClient'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import WaterWaveBackground from './waterFootprintCard/WaterWaveBackground'

interface Props {
  formattedValue: string
  learnMoreHref: string
}

export default function WaterFootprintCard({
  formattedValue,
  learnMoreHref,
}: Props) {
  return (
    <div className="bg-primary-700 relative min-h-64 overflow-hidden rounded-2xl p-6 md:p-10">
      <WaterWaveBackground />

      <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end md:gap-8">
        <div className="flex items-center gap-3 md:col-span-12">
          <WaterDropIcon className="h-12 w-12 fill-white" />

          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-4xl font-bold text-white md:text-5xl">
              {formattedValue}
            </span>

            <span className="text-base font-medium text-white/80">
              <Trans i18nKey="pollResults.waterFootprint.unit">
                litres / jour
              </Trans>
            </span>

            <span className="text-base text-white/80 md:ml-2">
              —{' '}
              <Trans i18nKey="pollResults.waterFootprint.averageLabel">
                empreinte eau moyenne des participants
              </Trans>
            </span>
          </p>
        </div>

        <p className="text-base leading-relaxed text-white md:col-span-8">
          <Trans i18nKey="pollResults.waterFootprint.body">
            C'est l'eau nécessaire pour produire et distribuer vos{' '}
            <strong>biens et services</strong>. En règle générale, les
            empreintes eau varient entre <strong>3 000</strong> et{' '}
            <strong>9 000</strong> litres par jour. L'eau dite "domestique"
            (douche, toilettes, cuisine...) n'est pas comptée.
          </Trans>
        </p>

        <div className="flex md:col-span-4 md:justify-end">
          <ButtonLink
            href={learnMoreHref}
            target="_blank"
            rel="noopener noreferrer"
            variant="filled"
            className="dark">
            <Trans i18nKey="pollResults.waterFootprint.learnMore">
              En savoir plus
            </Trans>
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}
