import { themes } from '../data/themes/index.ts'
import type { Theme } from '../types/theme.ts'

// eslint-disable-next-line @typescript-eslint/require-await
export const findThemes = async (): Promise<Theme[]> => themes
