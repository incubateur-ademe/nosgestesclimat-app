import { getActionAlternateLocales as _getActionAlternateLocales } from '@nosgestesclimat/core/features/actions/services/get-action-alternate-locales.service'
import { cache } from 'react'

export const getActionAlternateLocales = cache(_getActionAlternateLocales)
