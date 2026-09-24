import { ACTION_DETAIL_PATH } from '@/constants/urls/paths'
import { getLocalizedPath } from '@/helpers/language/getLocalizedPath'
import { LOCALE_EN_KEY, LOCALE_FR_KEY, type Locale } from '@/i18nConfig'
import type { Action } from '@nosgestesclimat/core/features/actions/types/action'

interface Props {
  from?: 'fin' | 'mon-espace' | 'index'
  action: Action
  locale: Locale
}

export function getActionHref({ from, action, locale }: Props) {
  const actionDetailPath = ACTION_DETAIL_PATH(action.theme.slug, action.slug)

  // On an /en page, an unprefixed (fr) path would be redirected to /en by the
  // locale middleware, so force the /fr prefix instead of relying on
  // getLocalizedPath's "no prefix for the default locale" behavior.
  const actionPath =
    locale === LOCALE_EN_KEY && action.language === LOCALE_FR_KEY
      ? `/${LOCALE_FR_KEY}${actionDetailPath}`
      : getLocalizedPath(action.language, actionDetailPath)

  return from ? `${actionPath}?from=${from}` : actionPath
}
