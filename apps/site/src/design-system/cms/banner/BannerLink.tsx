'use client'

import { trackingBannerClick } from '@/constants/tracking/misc'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'

export default function BannerLink({
  href,
  label,
}: {
  href: string
  label: string
}) {
  const { t } = useClientTranslation()

  return (
    <ButtonLink
      onClick={() => {
        trackMatomoEvent__deprecated(trackingBannerClick)
      }}
      size="sm"
      className="border-primary-100 text-primary-800 hover:border-primary-200 hover:bg-primary-100 hover:text-primary-800 inline-flex! bg-white px-2 py-1 transition-colors duration-300"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t(
        'banner.link.ariaLabel',
        "{{label}}, s'ouvre dans une nouvelle fenêtre",
        {
          label,
        }
      )}>
      {label}
    </ButtonLink>
  )
}
