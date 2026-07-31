'use server'

import type { Locale } from '@/i18nConfig'
import { getThemes as getThemesService } from '@nosgestesclimat/core/features/actions/services/get-themes.service'
import { toThemeDto } from './themes.dto'

export async function getThemes(locale: Locale) {
  const themes = await getThemesService(locale)
  return themes.map(toThemeDto)
}
