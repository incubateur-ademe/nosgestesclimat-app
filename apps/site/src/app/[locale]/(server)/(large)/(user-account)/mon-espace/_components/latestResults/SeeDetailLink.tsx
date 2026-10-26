import Trans from '@/components/translation/trans/TransClient'
import { END_PAGE_PATH } from '@/constants/urls/paths'
import {
  baseClassNames,
  getVariantClassNames,
  sizeClassNames,
} from '@/design-system/buttons/buttonStyles'
import Link from '@/design-system/links/Link'
import { cn } from 'cn'

export default function SeeDetailLink({ className }: { className?: string }) {
  return (
    <Link
      className={cn(
        baseClassNames,
        getVariantClassNames('outlined', 'primary'),
        sizeClassNames.md,
        'mt-24 flex gap-2 md:mt-0',
        className
      )}
      href={END_PAGE_PATH}>
      <span aria-hidden className="text-2xl leading-none">
        →
      </span>
      <Trans i18nKey="mon-espace.latestResults.viewDetail">
        Voir le détail
      </Trans>
    </Link>
  )
}
