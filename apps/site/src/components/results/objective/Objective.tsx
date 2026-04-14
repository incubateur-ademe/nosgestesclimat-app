import Title from '@/design-system/layout/Title'
import type { Locale } from '@/i18nConfig'
import Trans from '../../translation/trans/TransServer'
import CollectiveEfforts from './_components/CollectiveEffort'
import ObjectiveChart from './_components/ObjectiveChart'
import ObjectiveWithRhythm from './_components/ObjectiveWithRhythm'

interface Props {
  locale: Locale
  carbonFootprint: number
}

export default function Objective({ locale, carbonFootprint }: Props) {
  return (
    <div className="flex flex-col">
      <div className="-order-1 mb-6 md:order-0">
        <Title size="lg" tag="h2" hasSeparator={false}>
          <Trans locale={locale} i18nKey="results.objective.title">
            Objectif national :{' '}
            <span className="text-secondary-700">2T de CO₂e</span> par personne
            en 2050
          </Trans>
        </Title>
        <p>
          <Trans locale={locale} i18nKey="results.objective.description">
            L'objectif de la France pour atteindre la neutralité carbone en 2050
            et aider à limiter le réchauffement mondial à +&nbsp;2 °C.
          </Trans>
        </p>
      </div>

      <ObjectiveWithRhythm
        className="order-1 mb-8 md:order-0 md:mb-0"
        locale={locale}
        carbonFootprint={carbonFootprint}
      />

      <ObjectiveChart
        className="-order-1 mb-8 md:order-0 md:mb-0"
        carbonFootprint={carbonFootprint}
      />

      <CollectiveEfforts className="order-1" locale={locale} />
    </div>
  )
}
