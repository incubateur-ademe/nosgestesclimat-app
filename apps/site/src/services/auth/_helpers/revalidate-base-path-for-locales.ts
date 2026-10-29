import i18nConfig from '@/i18nConfig'
import { revalidatePath } from 'next/cache'

// Revalidate the destination route files (the i18n middleware rewrites the
// locale-less URL, so the route tags are keyed on /fr, /en, ...). Invalidating
// each locale's layout also invalidates all nested layouts and pages beneath.
export function revalidateBasePathForLocales() {
  for (const locale of i18nConfig.locales) {
    revalidatePath(`/${locale}`, 'layout')
  }
}
