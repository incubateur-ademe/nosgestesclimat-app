import Trans from '@/components/translation/trans/TransClient'
import { captureClickLatestResultsViewDetail } from '@/constants/tracking/posthogTrackers'
import { clickLatestResultsViewDetail } from '@/constants/tracking/user-account'
import { END_PAGE_PATH } from '@/constants/urls/paths'
import {
  baseClassNames,
  colorClassNames,
  sizeClassNames,
} from '@/design-system/buttons/Button'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'

export default function SeeDetailLink({ className }: { className?: string }) {
  return (
    <Link
      className={twMerge(
        baseClassNames,
        colorClassNames.secondary,
        sizeClassNames.md,
        'mt-24 flex gap-2 md:mt-0',
        className
      )}
      href={END_PAGE_PATH}
      data-track-event={clickLatestResultsViewDetail}
      data-track-posthog={captureClickLatestResultsViewDetail}>
      <span aria-hidden className="text-2xl leading-none">
        →
      </span>
      <Trans i18nKey="mon-espace.latestResults.viewDetail">
        Voir le détail
      </Trans>
    </Link>
  )
}
