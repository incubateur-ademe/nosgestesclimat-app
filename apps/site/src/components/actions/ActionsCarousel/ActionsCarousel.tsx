import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import { twMerge } from 'tailwind-merge'
import ActionsCarouselClient from './ActionsCarouselClient'

interface ActionsCarouselProps extends React.ComponentPropsWithoutRef<'div'> {
  locale: Locale
  /** className applied to the inner carousel that has `overflow: hidden` for padding tricks */
  innerClassName?: string
}

export default async function ActionsCarousel({
  className,
  innerClassName,
  children,
  locale,
  ...rest
}: ActionsCarouselProps) {
  const { t } = await getServerTranslation({ locale })

  const translations = {
    prevSlideMessage: t(
      'components.carousel.prevSlideMessage',
      'Diapo précédente'
    ),
    nextSlideMessage: t(
      'components.carousel.nextSlideMessage',
      'Diapo suivante'
    ),
    firstSlideMessage: t(
      'components.carousel.firstSlideMessage',
      'Ceci est la première diapo'
    ),
    lastSlideMessage: t(
      'components.carousel.lastSlideMessage',
      'Ceci est la dernière diapo'
    ),
    paginationBulletMessage: t(
      'components.carousel.paginationBulletMessage',
      'Aller à la diapo {{index}}'
    ),
    itemRoleDescriptionMessage: t(
      'components.carousel.itemRoleDescriptionMessage',
      'Diapo'
    ),
  }

  const roleDescription = t('components.carousel.roleDescription', 'Carrousel')

  return (
    <div
      {...rest}
      className={twMerge('relative', className)}
      role="region"
      aria-roledescription={roleDescription}>
      <ActionsCarouselClient
        translations={translations}
        className={innerClassName}>
        {children}
      </ActionsCarouselClient>
    </div>
  )
}
