'use server'

import { getThemes as getThemesService } from '@nosgestesclimat/core/features/actions/services/get-themes.service'
import { toThemeDto } from './themes.dto'

export async function getThemes() {
  const themes = await getThemesService()
  return themes.map(toThemeDto)
}
