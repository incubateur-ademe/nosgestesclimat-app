import i18nConfig from '@/i18nConfig'
import { revalidatePath } from 'next/cache'

/** The i18n router rewrites the locale-less URL, so route tags are keyed on
 * /fr, /en, ... The layout, not the page: the header reads the session. */
export function revalidateBasePathForLocales() {
  for (const locale of i18nConfig.locales) {
    revalidatePath(`/${locale}`, 'layout')
  }
}
