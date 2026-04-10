import { clickMySpaceNoResultsStartTest } from '@/constants/tracking/pages/mon-espace'
import { captureClickMySpaceNoResultsStartTest } from '@/constants/tracking/posthogTrackers'
import { TUTORIAL_PATH } from '@/constants/urls/paths'
import {
  baseClassNames,
  colorClassNames,
  sizeClassNames,
} from '@/design-system/buttons/Button'
import type { Locale } from '@/i18nConfig'
import { twMerge } from 'tailwind-merge'
import LockIcon from '../icons/LockIcon'
import Link from '../Link'
import Trans from '../translation/trans/TransServer'

export default function NoResultsBlock({ locale }: { locale: Locale }) {
  return (
    <div className="mt-2 mb-16 flex flex-col rounded-lg bg-slate-50 p-8">
      <p className="mb-6 flex items-center justify-center text-lg font-bold">
        <LockIcon className="fill-default mr-4 inline-block h-6 w-6 min-w-6" />
        <Trans locale={locale} i18nKey="mon-espace.noResults.description">
          Passez le test pour débloquer le contenu ici
        </Trans>
      </p>

      <div className="flex justify-center">
        <Link
          href={TUTORIAL_PATH}
          data-track-event={clickMySpaceNoResultsStartTest}
          data-track-posthog={captureClickMySpaceNoResultsStartTest}
          className={twMerge(
            baseClassNames,
            colorClassNames.secondary,
            sizeClassNames.md
          )}>
          <Trans locale={locale} i18nKey="mon-espace.noResults.link.text">
            Je calcule mon empreinte
          </Trans>
        </Link>
      </div>

      <div className="flex justify-center">
        <img
          src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/engagement_collectif_pour_le_climat_4f8f1edfc1.svg"
          alt=""
          width={340}
          className="grayscale"
        />
      </div>
    </div>
  )
}
