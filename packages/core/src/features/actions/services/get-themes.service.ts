import { findThemes } from '../repositories/themes.repository.ts'
import type { Theme } from '../types/theme.ts'

export const getThemes = async (): Promise<Theme[]> => findThemes()
