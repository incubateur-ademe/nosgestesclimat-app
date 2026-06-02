import { getPersonalizedActionsCatalogue as _getPersonalizedActionsCatalogue } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import { cache } from 'react'

export const getPersonalizedActionsCatalogue = cache(
  _getPersonalizedActionsCatalogue
)
