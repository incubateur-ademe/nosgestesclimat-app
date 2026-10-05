import Trans from '@/components/translation/trans/TransServer'
import BottomBannerWithCTA from '@/design-system/layout/BottomBannerWithCTA'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import type { Locale } from '@/i18nConfig'
import type { ReactNode } from 'react'
import SavePlanLink from './SavePlanLink'

interface Props {
  locale: Locale
  totalImpact: number
  actionsLength: number
}

export default function MobileSaveSelectionBanner({
  locale,
  totalImpact,
  actionsLength,
}: Props) {
  const { formattedValue: formattedActionsImpactSum, unit } = formatFootprint(
    totalImpact,
    {
      locale,
      metric: 'carbone',
    }
  )

  return (
    <BottomBannerWithCTA className="lg:hidden">
      <SavePlanLink className="w-full max-w-[320px]">
        <span className="text-center">
          <span className="inline-block text-base/normal font-bold">
            <Trans
              locale={locale}
              i18nKey="actions.seeActionPlanLink.mobile.label.firstLine">
              Voir mon plan d'action
            </Trans>
          </span>
          <br />
          <span className="inline-block text-sm/normal">
            <Trans
              locale={locale}
              i18nKey="actions.seeActionPlanLink.mobile.label.secondLine"
              values={{
                actionChoicesLength: actionsLength,
                pluralSuffix: actionsLength > 1 ? 's' : '',
              }}>
              {
                {
                  actionChoicesLength: actionsLength,
                } as unknown as ReactNode
              }{' '}
              action
              {
                {
                  pluralSuffix: actionsLength > 1 ? 's' : '',
                } as unknown as ReactNode
              }{' '}
            </Trans>
            {totalImpact > 0 && (
              <>
                {' '}
                / -{formattedActionsImpactSum} {unit}{' '}
                <Trans locale={locale}>CO₂e / an</Trans>
              </>
            )}
          </span>
        </span>
      </SavePlanLink>
    </BottomBannerWithCTA>
  )
}
